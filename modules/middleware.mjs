/**
 * @type {import("express").RequestHandler}
 */
export function log(req, res, next) {
    let current = Temporal.Now.plainTimeISO().toString().substring(0,8)

    console.log(`[${current}]: ${req.method} at ${req.originalUrl} from ${req.ip}`);

    // log req.params?
    next()
}

export function checkCollection(options) {
    return (req,res,next) => {
        if (options.col !== null) {
            next()
        } else {
            res.status(503).send()
        }
    }
}