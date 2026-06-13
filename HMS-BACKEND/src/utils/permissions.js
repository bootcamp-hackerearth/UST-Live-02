const permissions = {

    DASHBOARD: ["Admin"],

    ADD_PATIENT: ["Admin", "Receptionist"],
    VIEW_PATIENT: ["Admin", "Receptionist", "Doctor"],
    UPDATE_PATIENT: ["Admin","Receptionist"],
    DELETE_PATIENT: ["Admin"],

    ADD_EMPLOYEE: ["Admin"],
    VIEW_EMPLOYEE: ["Admin"],
    UPDATE_EMPLOYEE: ["Admin"],
    DELETE_EMPLOYEE: ["Admin"],

    ADD_DOCTOR: ["Admin"],
    VIEW_DOCTOR: ["Admin","Receptionist","Doctor","Patient"],
    UPDATE_DOCTOR: ["Admin"],
    DELETE_DOCTOR: ["Admin"],

    ADD_APPOINTMENT:["Admin","Receptionist","Patient"],
    VIEW_APPOINTMENT:["Admin","Receptionist","Doctor","Patient"],
    CANCEL_APPOINTMENT:["Admin","Receptionist","Patient"],



    APPROVE_EMPLOYEE:["Admin"],
    PENDING_APPROVE_EMPLOYEE:["Admin"]
}

module.exports = permissions;