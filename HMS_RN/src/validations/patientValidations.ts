import * as Yup from "yup";

const nameRegex = /^[A-Za-z\s.\-']+$/;
const stateRegex = /^[A-Za-z\s]+$/;
const indianPhoneRegex = /^(?:\+91)?\s*[6-9]\d{9}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const getPatientValidationSchema = (isEditMode: boolean) => {
    const baseSchema = {
        name: Yup.string()
            .trim()
            .required("Full name is required")
            .min(2, "Name must be at least 2 characters long")
            .max(50, "Name cannot exceed 50 characters")
            .matches(nameRegex, "Name can only contain alphabets, spaces, dots, hyphens, and apostrophes"),

        email: Yup
            .string()
            .required("Email is required")
            .matches(EMAIL_REGEX, "Please enter a valid email containing '@' and a domain (e.g., .com)"),

        phone: Yup.string()
            .required("Phone number is required")
            .matches(indianPhoneRegex, "Enter a valid 10-digit mobile number"),

        gender: Yup.string()
            .required("Gender is required")
            .test("is-valid-gender", "Please select a valid gender option", (value) => {
                return ["Male", "Female", "Other"].includes(value);
            }),

        dob: Yup.date()
            .required("Date of Birth is required")
            .min(new Date("1926-01-01"), "Date of Birth cannot be earlier than 1926")
            .max(new Date(), "Date of Birth cannot be in the future"),

        bloodGroup: Yup.string()
            .nullable()
            .optional()
            .test("is-valid-blood", "Invalid Blood Group", (value) => {
                if (!value || value.trim() === "") return true; 
                return ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(value);
            }),

        allergies: Yup.string()
            .trim()
            .nullable()
            .optional()
            .max(200, "Allergies descriptions cannot exceed 200 characters"),

        emergencyContact: Yup.string()
            .trim()
            .nullable()
            .optional()
            .test("is-valid-emergency", "Enter a valid 10-digit emergency number", (value) => {
                if (!value || value.trim() === "" || value === "+91" || value === "91") {
                    return true; 
                }
                return indianPhoneRegex.test(value);
            }),

        line1: Yup.string()
            .trim()
            .required("Address Line 1 is required")
            .min(5, "Address must be descriptive (min 5 characters)"),

        line2: Yup.string()
            .trim()
            .nullable()
            .optional(),

        state: Yup.string()
            .trim()
            .required("State is required")
            .matches(stateRegex, "State field cannot contain numbers or special characters"),

        pincode: Yup.string()
            .trim()
            .required("Pincode is required")
            .matches(/^\d{6}$/, "Pincode must be exactly 6 numeric digits"),
    };

    if (!isEditMode) {
        Object.assign(baseSchema, {
            password: Yup.string()
                .required("Password is required")
                .min(8, "Password must be at least 8 characters long")
                .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
                .matches(/[a-z]/, "Password must contain at least one lowercase letter")
                .matches(/\d/, "Password must contain at least one digit")
                .matches(/[\W_]/, "Password must contain at least one special character"),
            confirmPassword: Yup.string()
                .required("Please confirm your password")
                .oneOf([Yup.ref("password")], "Passwords must match"),
        });
    }

    return Yup.object().shape(baseSchema);
};