import { ObjectId } from 'mongodb'
import { AppData } from './data.mjs'

export function index(req, res) {
    res.render('pages/index')
}

export function docs(options) {
    return async (req, res, next)=>{
        if (options.col !== null) {
            const docs = await options.col.find({}).toArray()
            res.json( docs )
        }  
    }
}

export function add(options) {
    return async (req, res, next)=>{ 
        // added to server here
        const result = await options.col.insertOne( req.body )

        // update order
        updateOrder(options);

        res.json( result )
    }
}

export function remove(options) {
    // assumes req.body takes form { _id:5d91fb30f3f81b282d7be0dd } etc.
    return async (req,res) => {
        console.log(req.body.index)
        const findInter = await options.col.find()
        let delres; 
        // yes this solution hurts my soul. no I could not find a better one.
        for await(let doc of findInter) {
            if(doc.order == req.body.index) {
                delres = await options.col.deleteOne(doc)
            }
        }
        updateOrder(options)
        res.json( delres )
    }
}

export function update(options) {
    return async (req,res) => {
        console.log("old object:")
        console.log(req.body.oldObj)
        console.log("new object:")
        console.log(req.body.newObj)
        
        
        // const result = await options.col.updateOne(
        //     { _id: new ObjectId( req.body.id ) },
        //     { $set:{ name:req.body.name } }
        // )

        // up until here order is not changed for either object
        updateOrder(options)
        res.json( result )
    }
}

async function updateOrder(options) {
    // go through data and amend to add order field
    let data = await options.col.find({}).toArray()
    let appdata = new AppData(data)
    appdata.orderEntries()
    appdata.entries.forEach( async (element) => {
        await options.col.updateOne(
            { _id: new ObjectId( element._id ) },
            { $set:{ order:element.order } }
        )
    });
} 