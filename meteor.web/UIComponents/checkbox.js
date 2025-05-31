// src/components/common/Checkbox.js
import styled from 'styled-components';

const CheckboxWrapper = styled.div`
    display: inline-flex; /* Use inline-flex if needed for layout */
    align-items: center;
     /* Add margin if used as a standalone component */
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  // Hide checkbox visually but allow it to be focused and checked by keyboard
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: ${props => props.checked ? props.theme.colors.primary : props.theme.colors.neutral.white};
  border: 1px solid ${props => props.checked ? props.theme.colors.primary : '#ccc'};
  border-radius: 3px;
  transition: all 150ms;
  cursor: pointer;

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}40;
  }

   /* Checkmark icon */
  &:after {
      content: '';
      display: ${props => props.checked ? 'block' : 'none'};
      width: 5px;
      height: 9px;
      border: solid ${props => props.theme.colors.neutral.white};
      border-width: 0 2px 2px 0;
      transform: translate(5px, 2px) rotate(45deg); /* Position and rotate checkmark */
  }
`;

const CheckboxLabel = styled.label`
    margin-left: ${props => props.theme.spacing.small};
    cursor: pointer;
`;

const Checkbox = ({ className, checked, ...props }) => (
  <CheckboxWrapper className={className}>
    <HiddenCheckbox checked={checked} {...props} />
    <StyledCheckbox checked={checked} />
    {/* Label should be outside this component if associated with other text */}
  </CheckboxWrapper>
);

export default Checkbox;
