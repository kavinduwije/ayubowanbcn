import { ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export default function NotFound() { return <><Header locale="en"/><main className="not-found"><span className="eyebrow">A LITTLE DETOUR · 404</span><h1>This path ends here.<br/><em>Your journey doesn’t.</em></h1><p>Let’s get you back to the good part of Barcelona.</p><a className="button button-dark" href="/experiences">Explore our experiences<ArrowRight size={18}/></a></main><Footer locale="en"/></>; }
