"use client";
import { ChevronsLeftRight } from "lucide-react";
import { Avatar,AvatarImage } from "@radix-ui/react-avatar";
import { DropdownMenu,DropdownMenuItem, DropdownMenuContent, DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { SignOutButton, useUser } from "@clerk/clerk-react";
export const UserItem = () =>{
    const {user} = useUser();
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div role="button" className="flex items-center text-sm p-3 w-full hover:bg-primary/5">
                    <div className="gap-x-2 flex items-center max-w-[150px]">
                        <Avatar className="h-5 w-7 rounded-full overflow-hidden">
                            <AvatarImage src={user?.imageUrl}  />
                        </Avatar>
                        <span className="text-start font-medium line-clamp-1">
                            {user?.fullName}&apos;s Nexus
                        </span>
                    </div>
                    <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />   
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 bg-white rounded shadow-lg border-gray-200 dark:bg-neutral-700" align="start" alignOffset={11}>
                <div className="flex flex-col space-y-4 p-2">
                    <p className="text-xs font-medium leading-none text-muted-foreground">
                        {user?.emailAddresses[0].emailAddress}
                    </p>
                    <div className="flex items-center gap-x-2">
                        <div className="rounded-md bg-secondary">
                        <Avatar className="h-8 w-8 !important">
                            <AvatarImage 
                                src={user?.imageUrl}
                                className="h-8 w-8 rounded-full !important"
                                style={{ objectFit: 'cover', maxWidth: '100%', maxHeight: '100%' }}
                            />
                        </Avatar>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm line-clamp-1">
                                {user?.fullName}&apos;s Nexus
                            </p>
                        </div>
                    </div>
                </div>
                <DropdownMenuSeparator className="w-50 border-t border-gray-200 dark:border-neutral-900 my-1" />
                <DropdownMenuItem asChild className="w-full cursor-pointer text-muted-foreground text-sm text-start p-2 ">
                    <SignOutButton>
                        Log out
                    </SignOutButton>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}