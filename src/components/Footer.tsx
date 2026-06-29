import Image from "next/image"; 

export function Footer() {
    return (
        <footer>
        <div className="social-icons">
            <a href="https://github.com/ifpb" target="_blank" className="github">
                <Image src="/github.png" alt="GitHub" width={40} height={40} />
            </a>
            
            <a href="https://www.instagram.com/ifpb.joaopessoa/" target="_blank" className="instagram">
                <Image src="/instagram.png" alt="Instagram" width={60} height={60} />
            </a>
            
            <a href="https://www.linkedin.com/school/ifpb/" target="_blank" className="linkedin">
                <Image src="/linkedin.png" alt="LinkedIn" width={60} height={60} />
            </a>
        </div>
        </footer> 
    );
}