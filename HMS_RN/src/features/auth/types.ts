/**
 * @file types.ts
 * @overview Defines TypeScript interfaces for authentication and data models.
 * @description This file contains the core type definitions used throughout the application,
 * including shapes for user profiles, API responses, medical records, and more. It serves as a
 * single source of truth for data structures.
 */

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
    accessToken: string;
    user: User;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}

export interface Medication {
    _id?: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    deliveryMethod: string;
}

export interface MedicalObservation {
    _id?: string;
    metricName: string;
    metricValue: string;
    recordedTime: string;
}

export interface MedicalRecord {
    _id: string;
    recordCode: string;
    doctorEmployeeId: string;
    doctorName?: string;
    doctorSpecialization?: string;
    appointmentId: string;
    patientId: string;
    visitDate: string;
    diagnosis: string;
    complaint: string;
    symptoms: string;
    medications: Medication[];
    medicalObservations: MedicalObservation[];
    notes: string;
    status: "FINAL" | "DRAFT" | "DELETED";
    createdAt: string;
    updatedAt: string;
}