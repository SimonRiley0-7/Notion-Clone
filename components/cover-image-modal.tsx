"use client";
import {Dialog,DialogContent,DialogHeader} from "@/components/ui/dialog";
import { useCoverImage } from "@/hooks/use-cover-image";
import { SingleImageDropzone } from "./single-image-dropzone";
import { useEdgeStore } from "@/lib/edgestore";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
export const CoverImageModal = ()=>{
    const [file,setFile] = useState<File>();
    const [isSubmitting,setIsSubmitting] = useState(false);
    const {edgestore} = useEdgeStore();
    const coverImage = useCoverImage();
    const update = useMutation(api.documents.update);
    const params = useParams();

    const onClose = ()=>{
        setFile(undefined);
        setIsSubmitting(false);
        coverImage.onClose();
    }

    const onChange = async(file?:File)=>{
        if(file){
            setIsSubmitting(true);
            setFile(file);
            const res = await edgestore.publicFiles.upload({
                file,
                options:{
                    replaceTargetUrl:coverImage.url
                }
            });
            await update({
                id:params.documentId as Id<"documents">,
                coverImage: res.url
            });
            onClose();
        }
    }
    return(
        <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
            <DialogContent>
                <DialogHeader className="border-b pb-3">
                    <h2 className="text-center text-lg font-semibold">
                        Cover Image
                    </h2>
                </DialogHeader>
                <SingleImageDropzone className="w-full outline-none" disabled={isSubmitting} value={file} onChange={onChange}/>
            </DialogContent>
        </Dialog>
    )
}