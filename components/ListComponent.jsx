import Link from "next/link"
import styles from "./ListComponent.module.css"
export default function ListComponent({btnText, href}){
    return(
        <>
        <Link href={href}>
        <button className={styles.btn}>
         {btnText}
        </button>
        </Link>
        </>
    )
}