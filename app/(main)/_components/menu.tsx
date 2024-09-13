"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { DropdownMenu, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useMutation } from "convex/react";
import { MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MenuProps{
    documentId: Id<"documents">;
}
export const Menu = ({
    documentId,
}:MenuProps) =>{
    const router = useRouter();
    const {user}=useUser();
    const archive = useMutation(api.documents.archive);
    const onArchive = ()=>{
        const promise = archive({id:documentId});
    toast.promise(promise, {
        loading:"Moving to Trash",
        success:"Note Moved to Trash",
        error:"Failed to archive Note"
    })
router.push("/documents");
}
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end" side="right" sideOffset={8}>
                <DropdownMenuItem>
                    <Trash className="h-4 w-4 mr-2"/>Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator className="text-xs text-muted-foreground p-2"/>
                <div>Last edited by: {user?.fullName}</div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

Menu.Skeleton = function MenuSkeletion(){
    return(
        <Skeleton className="h-10 w-10"/>
    )
}