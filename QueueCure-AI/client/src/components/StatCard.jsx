export default function StatCard({title,value,emoji}){

    return(

        <div className="card">

            <div style={{fontSize:"40px"}}>

                {emoji}

            </div>

            <h3>{title}</h3>

            <h1>{value}</h1>

        </div>

    )

}