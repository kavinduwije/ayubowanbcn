import { Brand } from "@/components/brand";
import { StudioAccess } from "@/components/studio-access";
export const metadata = { title: "Enquiries studio", robots: { index:false, follow:false } };
export default function StudioPage() {
 return <main className="studio-page"><header className="studio-header"><a href="/"><Brand/></a><a href="/">Back to the website ↗</a></header><StudioAccess/></main>;
}
