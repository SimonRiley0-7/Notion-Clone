"use client";
import { Cover } from "@/components/cover";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Toolbar } from "@/components/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { api }  from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
interface DocumentIdPageProps{
    params:{
        documentId:Id<"documents">;
    };
};
const DocumentIdPage = ({
    params
}:DocumentIdPageProps) => {
    const Editor = useMemo(()=>dynamic(()=>import("@/components/editor"), {ssr:false}) ,[]);
    const pa = useParams();
    const searchParams = useSearchParams();
    const [isNewPage, setIsNewPage] = useState(false);

    useEffect(() => {
        // Check if 'new' is present in the search params
        setIsNewPage(searchParams.get('new') === 'true');
    }, [searchParams]);
    const newPage = false;
    const document = useQuery(api.documents.getById,{
        documentId: params.documentId,
    });
    const update = useMutation(api.documents.update);
    const onChange = (content:string)=>{
        update({
            id: params.documentId,
            content
        });  
    }
    if(document===undefined){
        return (<div>
            <Cover.Skeleton/>
            <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
                <div className="space-y-4 pl-8 pt-4">
                    <Skeleton className="h-14 w-[50%]"/>
                    <Skeleton className="h-4 w-[80%]"/>
                    <Skeleton className="h-4 w-[40%]"/>
                    <Skeleton className="h-4 w-[60%]"/>
                    </div></div>Loading...</div>)
    }
    if(document===null){
        return <div>Not Found</div>;
    }
    return ( 
    <div className="pb-40">
        <Cover url={document.coverImage}/>
        <div className="md:max-w-3l lg:max-w-4xl mx-auto">
            <Toolbar initialData={document}/>
            <Editor initialContent={document.content} onChange={onChange}   />
        </div>
    </div> 
    );
}
 
export default DocumentIdPage;