import { Department } from "./department.model.js";

export interface UserTicket {
    _id: string,
    email: string,
    name: string,
    role: string,
}

export interface Contract {
    _id: string,
    name: string,
    startDate: Date,
    endDate: Date,
}

export interface CompanyTicket {
    _id: string,
    name: string,
    email: string,
    contracts?: Contract[],
}

export interface Comment {
    _id: string,
    user: UserTicket,
    content: string,
    hours: number,
    internal?: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export interface Event {
    _id: string,
    user: UserTicket,
    type: string,
    createdAt: Date,
    updatedAt: Date,
}

export interface Ticket {
    _id: string,
    subject: string,
    content: string,
    content_user: UserTicket,
    status: string,
    priority: string,
    company: CompanyTicket,
    customer: UserTicket,
    agent?: UserTicket,
    department: Department,
    minutes?: number,
    comments?: Comment[],
    events?: Event[],
    createdAt: Date,
    updatedAt: Date,
    hasInternalComments?: boolean,
}