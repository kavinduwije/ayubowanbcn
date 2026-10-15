import DocumentLayout from "@/components/document-layout";
export { metadata, viewport } from "@/components/document-layout";
export default function Layout({children}:{children:React.ReactNode}) {return <DocumentLayout locale="es">{children}</DocumentLayout>;}
