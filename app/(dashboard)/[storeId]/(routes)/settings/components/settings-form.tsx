"use client"

import { Heading } from "@/components/ui/heading";
import { Store } from "@/lib/generated/prisma";

interface SettingsFormProps {
    initialData: Store;
}


export const SettingsForm: React.FC<SettingsFormProps> = ({
    initialData
}) => {
    return (
        <div className="flex items-center justify-between">
            <Heading 
            title="Settings"
            description = "Manage store preferences"
            />
        </div>
    );
};