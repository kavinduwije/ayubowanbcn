export { default, generateMetadata } from "@/components/route-page";
export const dynamicParams = false;
import { generateStaticParams as paths } from "@/components/route-page";
export function generateStaticParams() {return paths().filter(x=>x.segments[0]!=="es");}
