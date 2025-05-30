// Models 05/28/2025

//  Models.swift
//  meteor.swift
//
//  Created by Aaron Kane on 5/22/25.
//

import SwiftUI
import FirebaseAuth
import FirebaseFirestore
import FirebaseStorage
import Combine
import Foundation
import PhotosUI
import UniformTypeIdentifiers

struct UserProfile: Identifiable, Codable {
    var id: String
    var name: String
    var role: String // "Entrepreneur" or "Mentor"
    var industry: String
    var goals: String
    var profilePictureURL: String?
    var resumeURL: String?
}

class SignUpViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var role = "Entrepreneur"
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var signUpSuccess = false

    let roles = ["Entrepreneur", "Mentor"]

    func signUp() {
        errorMessage = nil

        guard !email.isEmpty, !password.isEmpty, !confirmPassword.isEmpty else {
            errorMessage = "Please fill in all fields."
            return
        }

        guard password == confirmPassword else {
            errorMessage = "Passwords do not match."
            return
        }

        isLoading = true

        Auth.auth().createUser(withEmail: email, password: password) { [weak self] result, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let error = error {
                    self?.errorMessage = error.localizedDescription
                } else {
                    self?.signUpSuccess = true
                }
            }
        }
    }
}

struct SignUpView: View {
    @StateObject private var viewModel = SignUpViewModel()

    var body: some View {
        VStack(spacing: 20) {
            Text("Sign Up")
                .font(.largeTitle)
                .bold()

            TextField("Email", text: $viewModel.email)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)

            SecureField("Password", text: $viewModel.password)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)

            SecureField("Confirm Password", text: $viewModel.confirmPassword)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)

            Picker("Role", selection: $viewModel.role) {
                ForEach(viewModel.roles, id: \.self) { role in
                    Text(role)
                }
            }
            .pickerStyle(SegmentedPickerStyle())
            .padding(.vertical)

            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }

            if viewModel.isLoading {
                ProgressView()
            }

            Button(action: {
                viewModel.signUp()
            }) {
                Text("Sign Up")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.lightRed)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            .disabled(viewModel.isLoading)

            Spacer()
        }
        .padding()
        .alert(isPresented: $viewModel.signUpSuccess) {
            Alert(title: Text("Success"), message: Text("Account created!"), dismissButton: .default(Text("OK")))
        }
    }
}

struct LoginView: View {
    @StateObject private var viewModel = AuthViewModel()
    @State private var showSignUp = false

    var body: some View {
        VStack(spacing: 20) {
            Text("Login")
                .font(.largeTitle)
                .bold()

            TextField("Email", text: $viewModel.email)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)

            SecureField("Password", text: $viewModel.password)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)

            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }

            if viewModel.isLoading {
                ProgressView()
            }

            Button(action: {
                viewModel.login()
            }) {
                Text("Login")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.lightRed)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            .disabled(viewModel.isLoading)

            HStack {
                Text("Don't have an account?")
                Button("Sign Up") {
                    showSignUp = true
                }
                .foregroundColor(.blue)
            }
            .padding(.top, 10)

            Spacer()
        }
        .padding()
        .sheet(isPresented: $showSignUp) {
            SignUpView()
        }
        .alert(isPresented: $viewModel.loginSuccess) {
            Alert(title: Text("Success"), message: Text("Logged in!"), dismissButton: .default(Text("OK")))
        }
    }
}

class AuthViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var loginSuccess = false
    @Published var isLoggedIn: Bool = false
    @Published var userProfile: UserProfile?
    @Published var isProfileComplete: Bool = false
    @Published var isLoadingProfile: Bool = false
    
    private var authStateHandle: AuthStateDidChangeListenerHandle?
    
    init() {
        Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                self?.isLoggedIn = (user != nil)
            }
        }
    }
    
    func login() {
        errorMessage = nil
        
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Please enter both email and password."
            return
        }
        
        isLoading = true
        
        Auth.auth().signIn(withEmail: email, password: password) { [weak self] result, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let error = error {
                    self?.errorMessage = error.localizedDescription
                } else {
                    self?.loginSuccess = true
                }
            }
        }

class CompleteProfileViewModel: ObservableObject {
    @Published var name = ""
    @Published var industry = ""
    @Published var goals = ""
    @Published var profileImage: UIImage?
    @Published var resumeURL: URL?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var successMessage: String?

    // MARK: URLs to be saved in Firestore
    
    private var profilePictureURLString: String?
    private var resumeURLString: String?

    func saveProfile() {
        guard let user = Auth.auth().currentUser else {
            errorMessage = "User not logged in."
            return
        }
        errorMessage = nil
        isLoading = true

        // MARK: Upload profile image if selected
        
        if let image = profileImage {
            uploadImage(image, userId: user.uid) { [weak self] urlString in
                self?.profilePictureURLString = urlString
                self?.uploadResumeIfNeeded(userId: user.uid)
            }
        } else {
            uploadResumeIfNeeded(userId: user.uid)
        }
    }

    private func uploadResumeIfNeeded(userId: String) {
        if let resumeURL = resumeURL {
            uploadResume(resumeURL, userId: userId) { [weak self] urlString in
                self?.resumeURLString = urlString
                self?.saveProfileData(userId: userId)
            }
        } else {
            saveProfileData(userId: userId)
        }
    }

    private func uploadImage(_ image: UIImage, userId: String, completion: @escaping (String?) -> Void) {
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            self.errorMessage = "Could not process image."
            self.isLoading = false
            return
        }
        let ref = Storage.storage().reference().child("profile_pictures/\(userId).jpg")
        ref.putData(imageData, metadata: nil) { metadata, error in
            if let error = error {
                DispatchQueue.main.async {
                    self.errorMessage = "Image upload failed: \(error.localizedDescription)"
                    self.isLoading = false
                }
                return
            }
            ref.downloadURL { url, error in
                DispatchQueue.main.async {
                    completion(url?.absoluteString)
                }
            }
        }
    }

    private func uploadResume(_ fileURL: URL, userId: String, completion: @escaping (String?) -> Void) {
        let ref = Storage.storage().reference().child("resumes/\(userId)_resume.\(fileURL.pathExtension)")
        ref.putFile(from: fileURL, metadata: nil) { metadata, error in
            if let error = error {
                DispatchQueue.main.async {
                    self.errorMessage = "Resume upload failed: \(error.localizedDescription)"
                    self.isLoading = false
                }
                return
            }
            ref.downloadURL { url, error in
                DispatchQueue.main.async {
                    completion(url?.absoluteString)
                }
            }
        }
    }

    private func saveProfileData(userId: String) {
        let db = Firestore.firestore()
        var data: [String: Any] = [
            "name": name,
            "industry": industry,
            "goals": goals
        ]
        if let profilePictureURLString = profilePictureURLString {
            data["profilePictureURL"] = profilePictureURLString
        }
        if let resumeURLString = resumeURLString {
            data["resumeURL"] = resumeURLString
        }
        db.collection("users").document(userId).setData(data, merge: true) { error in
            DispatchQueue.main.async {
                self.isLoading = false
                if let error = error {
                    self.errorMessage = "Failed to save profile: \(error.localizedDescription)"
                } else {
                    self.successMessage = "Profile saved successfully!"
                }
            }
        }
    }
}

struct CompleteProfileView: View {
    @StateObject private var viewModel = CompleteProfileViewModel()
    @State private var showImagePicker = false
    @State private var showDocumentPicker = false

    var body: some View {
        VStack(spacing: 20) {
            Text("Complete Your Profile")
                .font(.title)
                .bold()

            TextField("Name", text: $viewModel.name)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)

            TextField("Industry", text: $viewModel.industry)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)

            TextField("Goals", text: $viewModel.goals)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)

            // MARK: Profile Picture Picker
            Button(action: { showImagePicker = true }) {
                HStack {
                    Image(systemName: "person.crop.circle.badge.plus")
                    Text(viewModel.profileImage == nil ? "Select Profile Picture" : "Change Profile Picture")
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
            if let image = viewModel.profileImage {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 100)
                    .clipShape(Circle())
            }

            // MARK: Resume Picker
            
            Button(action: { showDocumentPicker = true }) {
                HStack {
                    Image(systemName: "doc.badge.plus")
                    Text(viewModel.resumeURL == nil ? "Upload Resume" : "Change Resume")
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
            if let resumeURL = viewModel.resumeURL {
                Text("Selected: \(resumeURL.lastPathComponent)")
                    .font(.caption)
            }

            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }
            if let successMessage = viewModel.successMessage {
                Text(successMessage)
                    .foregroundColor(.green)
                    .multilineTextAlignment(.center)
            }
            if viewModel.isLoading {
                ProgressView()
            }

            Button(action: {
                viewModel.saveProfile()
            }) {
                Text("Save Profile")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            .disabled(viewModel.isLoading)

            Spacer()
        }
        .padding()
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(image: $viewModel.profileImage)
        }
        .sheet(isPresented: $showDocumentPicker) {
            DocumentPicker(documentURL: $viewModel.resumeURL)
        }
    }
}

// MARK: - Image Picker (UIKit wrapper)

struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: ImagePicker
        init(_ parent: ImagePicker) { self.parent = parent }
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let uiImage = info[.originalImage] as? UIImage {
                parent.image = uiImage
            }
            picker.dismiss(animated: true)
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            picker.dismiss(animated: true)
        }
    }

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .photoLibrary
        return picker
    }
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
}

// MARK: - Document Picker (UIKit wrapper)

struct DocumentPicker: UIViewControllerRepresentable {
    @Binding var documentURL: URL?
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIDocumentPickerDelegate {
        let parent: DocumentPicker
        init(_ parent: DocumentPicker) { self.parent = parent }
        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            parent.documentURL = urls.first
        }
        func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {}
    }
    
    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: [UTType.pdf, UTType.data, UTType.text], asCopy: true)
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}
                }
            }
        }


