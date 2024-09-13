import Image from "next/image";
export const Heroes = () => {
    return (
        <div className="flex flex-co items-center justify-center max-w-5xl">
            <div className="flex items-center">
                <div className="relative w-[300px] h-[300px] sm: w-[350px] sm: h-[350px] md: h-[400px] md: w-p[400px]">
                    <Image src="/documents.png" fill alt="Documents" className="object-contain dark:hidden"/>
                    <Image src="/documentsdark.png" fill alt="Documentsdark" className="object-contain hidden dark:block"/>
                </div>
                <div className="relative h-[300px] w-[300px] hidden md:block">
                    <Image src="/read.png" fill alt = "Read" className="object-contain dark:hidden"/>
                    <Image src="/readdark.png" fill alt="Readdark" className="object-contain hidden dark:block"/>
                </div>
            </div>
        </div>
    );
};