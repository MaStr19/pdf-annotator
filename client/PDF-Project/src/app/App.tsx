import { useState, useEffect } from 'react'
import PDFViewer from '../components/pdfviewer'
import Navbar from '../components/navbar'
import Modal from '../components/modal'
import './App.css'

import { Canvas } from 'fabric'


function App() {
 
    
    const [rotation, setRotation] = useState(0);
    const [page, setPage] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [tool, setTool] = useState("select");

    const [token, setToken] = useState<string>("")
    const [download, setDownload] =useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [annotate, setAnnotate] = useState<Record<number, Canvas>>({});

    const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
    const [pdfName, setPdfName] = useState<string | null>(null);

    useEffect(() => {

        const token_getter = async ()=>{
            
            try{
                
                const qs = new URLSearchParams({ email }).toString();

                const res = await fetch(`/api/provide-token?${qs}`, {
                    method: "POST",
                });
                
                if(res.ok){
                    await res.json().then(x=>setToken(x["access_token"]))
                    
                }
            }catch{
                return;
            }
        }
        if(email != ""){
            token_getter();
            setEmail("")
        }
    }, [email]);

    async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        return;
        }
        setPdfName(file.name);

        const buf = await file.arrayBuffer();
        setPdfBytes(buf);
        setPage(1);
        setScale(1.25);
    }

  return (
    <>
      
    <div className='bg-gray-50'>
        <div className='bg-white border-solid border-b-1'>
            <header className="h-20 p-4">
                <div className='w-50'>
                    <a className="block text-teal-600" href="https://www.taxpeer.de">
                        <img className="w-max h-10" src="https://cdn.prod.website-files.com/6683aafb774e070340fd2bcc/66a7ef7362615531efb51614_Logo_Full.png"></img>
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <input type="file" accept="application/pdf" onChange={onPickFile} />
                    {pdfName && <span className="text-sm text-gray-600">{pdfName}</span>}
                </div>
                
            </header>
        </div>
        <div>
         {isModalOpen && <Modal isOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setEmail={setEmail}/>}
        </div>

        <div className='bg-white m-4 border-solid border-1 rounded-md flex flex-col justify-center items-center space-x-6'>
            <div className='h-20 w-full m-0'>
                <Navbar 
                setPage={setPage} 
                setRotation={setRotation} 
                setScale={setScale} 
                rotation={rotation} 
                page={page} 
                scale={scale}
                tool={tool}
                setTool={setTool}
                setDownload={setDownload}
                download={download}
                setModalOpen={setIsModalOpen}
                />
            </div>
            {pdfBytes? (
            <div className='overflow-hidden border-solid border-2 '>
                <PDFViewer 
                fileUrl='/example.pdf' 
                rotation={rotation} 
                page={page} 
                scale={scale}
                annotate={annotate}
                setAnnotate={setAnnotate}
                tool={tool}
                download={download}
                upload={false}
                setTool={setTool}
                setDownload={setDownload}
                setPage={setPage}
                token={token}
                fileData={pdfBytes}
                />
            </div>
            ):
            <p>Upload a PDF to start annotating.</p>
            }
        </div>
    </div>
        
    
    </>
  )
}

export default App
