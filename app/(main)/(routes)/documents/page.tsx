"use client";

import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const DocumentsPage = () => {
    const {user} = useUser();
    const create = useMutation(api.documents.create);
    const onCreate = () =>{
        const promise=create({ title:"Untitled"});
        toast.promise(promise,{
            loading:'Creating a New Note...',
            success:'Note Created',
            error:'Failed to create Note'
        });
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Image src="/empty.png" alt="empty" height="300" width="300" className="dark:hidden" />
            <Image src="/emptydark.png" alt="empty" height="300" width="300" className="hidden dark:block" />
            <h2 className="text-lg font-medium">Welcome to {user?.firstName}&apos;s Nexus</h2>
            <Button onClick={onCreate}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create a note
            </Button>
        </div>
    
    );
}

export default DocumentsPage;
