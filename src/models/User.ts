import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
    telegramId: number;
    firstname: string;
    userName: string;
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    telegramId: { type: Number, required: [true, 'Telegram ID is required'], uniq: true },
    firstname: { type: String },
    userName: { type: String },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);