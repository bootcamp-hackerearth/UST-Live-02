export interface PatientProfile {
    _id: string;
    UHID: string;
    name: string;
    email: string;
    phone: string;
    gender: "Male" | "Female" | "Other";
    dob: string; 
    bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    allergies?: string[];
    emergencyContact?: string;
    status: boolean;
    address: {
        line1: string;
        line2?: string;
        state: string;
        pincode: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface User {
    _id: string;
    email: string;
    role: string;
    profile: PatientProfile;
}

export interface LoginResponse {
    message?: string;
    token: string;
    user: User;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}