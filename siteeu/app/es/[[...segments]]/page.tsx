import SitePage, {generateMetadata as metadata, generateStaticParams as paths} from "@/components/route-page";
export const dynamicParams = false;
type Props={params:Promise<{segments?:string[]}>};
export function generateStaticParams() {return paths().filter(x=>x.segments[0]==="es").map(x=>({segments:x.segments.slice(1)}));}
function localised(props:Props) {return {params:props.params.then(p=>({segments:["es",...(p.segments || [])]}))};}
export function generateMetadata(props:Props) {return metadata(localised(props));}
export default function Page(props:Props) {return SitePage(localised(props));}
