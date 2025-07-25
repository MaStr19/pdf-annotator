import { useState } from "react";



export default function Navbar(props:{setPage:React.Dispatch<React.SetStateAction<number>>, setScale:React.Dispatch<React.SetStateAction<number>>, setRotation:React.Dispatch<React.SetStateAction<number>>, rotation:number, page:number, scale:number}){
    const [mode, setMode] = useState(true);

    function handleRotate(){
        if(props.rotation == 270){
            props.setRotation(0);
        }
        else{
            props.setRotation(props.rotation +90)
        }
    }
    function handleCounterRotate(){
        if(props.rotation == 0){
            props.setRotation(270);
        }
        else{
            props.setRotation(props.rotation - 90)
        }
    }
    function handlePageIncrement(){
        if(props.page == -1){
            console.log("ist -1");
            props.setPage(1);
        }
        else{
            console.log("ist nicht -1");
            props.setPage(props.page + 1)
        }
    }
    function handlePageDecrement(){
        if(props.page == 1){
            props.setPage(1);
        }
        else{
            props.setPage(props.page - 1)
        }
    }
    function handleScaleIncrement(){
        if(props.scale == 3){
            props.setScale(3);
        }
        else{
            props.setScale(props.scale + 0.25)
        }
    }
    function handleScaleDecrement(){
        if(props.scale == 0.25){
            props.setScale(0.25);
        }
        else{
            props.setScale(props.scale - 0.25)
        }
    }


    return(
        <>
        <header>
            <div className="inline-flex">
                <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l" onClick={() =>{setMode(true), console.log(mode)}}>
                    View
                </button>
                <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r" onClick={() =>{setMode(false), console.log(mode)}}>
                    Annotate
                </button> 
            </div>
        </header>
        <div>
            {
            mode ? (
                <header>
                    <ul>
                        <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>{handleCounterRotate()}}>counter-clockwise</button>
                        <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handleRotate()}>clockwise</button>
                        <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handlePageIncrement()}>up</button>
                        <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handlePageDecrement()}>down</button>
                        <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handleScaleIncrement()}>zoom-in</button>
                        <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handleScaleDecrement()}>zoom-out</button>
                    </ul>
                </header>
            )
            
            :
            
            (
                <header>
                    <ul>
                        <button>Hallo</button>
                        <button>Tschüss</button>
                        <button>OK</button>
                    </ul>
                </header>
            )
            }
        </div>
        </>
    )
    
}