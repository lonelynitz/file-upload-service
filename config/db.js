import { Pool } from 'pg'

const dbConnect = () => {
    let pool = new Pool({
        user : 'postgres',
        host : 'localhost',
        database : 'default',
        password : 'admin123',
        port : 7800
    })

    return pool
}

export default dbConnect