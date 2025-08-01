
export default function Modal(props:{

    isOpen:boolean,
    setIsModalOpen:React.Dispatch<React.SetStateAction<boolean>>,
    setEmail:React.Dispatch<React.SetStateAction<string>>

}) {
    
    

    const get_input = ()=>{

        const form = document.forms.namedItem("Email_input") as HTMLFormElement | null;
        const input = form?.elements.namedItem("email_input") as HTMLInputElement | null;
        let textfield = input?.value || "";
        if (textfield!="matt.strauck@gmail.com"){
            return "";
        }
        return(textfield!);
    }

    return(
        <>
            <div>
                <h1>Enter Email:</h1>
                <form name="Email_input">
                    <input id={"email_input"} type="text"></input>
                </form>
                <button onClick={()=>props.setEmail(get_input())}>Submit</button>
                <button onClick={()=>props.setIsModalOpen(false)}>Close</button>
            </div>
        </>
    )
}