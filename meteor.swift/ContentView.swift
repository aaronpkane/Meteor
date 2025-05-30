// ContentView file 05/28/2025

//Meteor.swift
//Created by Aaron Kane
//Created on 5/20/2025

import SwiftUI
import Foundation
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore
import FirebaseStorage
import UIKit

//MARK: - Color Palette located in Assets
    //static let whiteSmoke: Color = Color(red: 245, green: 243, blue: 244) // hex: #F5F3F4
    //static let lightRed: Color = Color(red: 255, green: 104, blue: 107) // hex: #FF686B

    //MARK: Insert Firebase SDK Init snippet (CodeHousing) here.

@main
struct MeteorApp: App {
    
    //MARK: Insert AppDelegate snippet (CodeHousing) here.
    
    init() {
        FirebaseApp.configure()
            }
        
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

//MARK: Content View

struct ContentView: View {
    @StateObject private var authViewModel = AuthViewModel()
    
    var body: some View {
        
        ZStack {
            Color.whiteSmoke
                .ignoresSafeArea()
            Group {
                        if authViewModel.isLoggedIn {
                            MainAppView() // Your main app content
                        } else {
                            LoginView() // Or SignUpView()
                        }
                    }
            .environmentObject(authViewModel)
                }
            }
        }

struct MainAppView: View {
    var body: some View {
        Text("Welcome to the main app!")
    }
}
    
