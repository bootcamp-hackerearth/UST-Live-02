const app=require('./app');

const connection=require('./src/config/db')
const connectDB=require('./src/config/db')
const seedAdmin=require('./src/utils/seedAdmin')
const seedData=require('./src/utils/seedData')
const seedMenu=require('./src/utils/seedMenu')
connectDB();



const PORT=process.env.PORT||5000;



app.listen(PORT,'0.0.0.0',()=>
{
    console.log(`Server running on http://localhost:${PORT}`);
})
seedMenu();
seedData();
seedAdmin();