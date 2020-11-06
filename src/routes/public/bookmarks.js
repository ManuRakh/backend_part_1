import { Router } from 'express';
import axios from 'axios'
import models from '../../models';
let bookMark_model = models.bookmark


const router = Router();

/**
 * @api {post} [dev-]backend.wazzup24.com/api/v1/promoCodes/random Generate random promoCode
 * @apiDescription Генерация случайного уникального промокода
 * @apiVersion 1.0.0
 * @apiName generate_random_promo_code
 * @apiGroup PromoCodes
 * @apiPermission all
 *
 * @apiSuccessExample SUCCESS:
 *   HTTP/1.1 200 OK
 *   {
 *     "data": {
 *       "code": "4pvugb"
 *     }
 *   }
 *
 * @apiErrorExample ALL EXAMPLES:
 *   HTTP/1.1 400 Bad Request
 *   {
 *     "errors": {
 *       "backend": [
 *         "Can't generate promoCode",
 *         "No more attempts"
 *       ]
 *     }
 *   }
 */
router.post("/", async (req, res) => {
 try {
    const body = req.body
    const link = body.link
    if(validateLink(link)===true)
    {
        let bookmark = await bookMark_model.create(body)
        const values = (bookmark.dataValues)
        res.status(200).send({
            data:{
            guid:values.guid,
            createdAt:values.createdAt.getTime()
            }
        })
    }
    else res.status(400).send({
        errors: [
          {
            code: 'BOOKMARKS_INVALID_LINK',
            description: 'Invalid link'
          }
        ]
      })   
    } 
catch (error) {
    console.log(error)
  }
});
router.get("/", async (req, res) => {
    try {
        let body = req.query
        let search_params = (get_input_values(body, {
            limit : 50, 
            offset : 0,
            sort_by : "createdAt", 
            sort_dir : "asc"
        }))
        console.log(search_params)
        const where = {}
        if(search_params['filter_value']!=undefined&&search_params["filter"]!=undefined)
        where[search_params["filter"]]=search_params['filter_value']
        let order = [[search_params.sort_by, search_params.sort_dir]]
        console.log(where)
        // order: [['updatedAt', 'DESC']]
        let bookmark = await bookMark_model.findAndCount({
            where:where,
            order:order,
            limit:search_params.limit,
            offset:search_params.offset
        })
        res.status(200).send(bookmark)
    } catch (error) {
        res.status(400).send("false")   
    }
    
})
router.get("/:guid", async (req, res) => {
    try {
        const guid = req.params.guid 
        let bookmark = await bookMark_model.find({where:{guid:guid}})
        bookmark = bookmark.dataValues
        bookmark.title = bookmark.link
        bookmark.image = ""
        bookmark.whois = await (await send_axios_request(bookmark.link)).data
        delete bookmark.link
        console.log(bookmark)
        res.status(200).send(bookmark)
    } catch (error) {
        res.status(400).send(error)

    }
 
})
router.patch("/:guid", async (req, res) => {
    try {
        let body = req.body
        let guid = req.params.guid
        if(validateLink(body.link)===true){

        let patch_params = get_input_values(body, {})
        await  bookMark_model.update(patch_params, {where:{guid:guid}})
        res.status(200).send(patch_params)
        }
        else res.status(400).send({
            errors: [
              {
                code: 'BOOKMARKS_INVALID_LINK',
                description: 'Invalid link'
              }
            ]
          }) 
    } catch (error) {
        res.status(400).send(error)
    }
})
router.delete("/:guid", async (req, res) => {
    console.log("DETELE")
    let guid = req.params.guid
    let result = await bookMark_model.destroy({where:{guid:guid}})
    if(result===1)
    res.status(200).send("OK")
    else res.status(404).send("Not found")
})
function get_input_values(body, innerObj){//
    let obj =  innerObj
    for (const [key, value] of Object.entries(body)) {
        if(value!=undefined) obj[key]=value
        if(value==="true") obj[key]=true
        if(value==="false") obj[key]=false

      }
    return obj
}
function validateLink(link) {
    if(/(http(s?)):\/\//i.test(link)) {
      // do something here
      return true
    }
    return false
  }
async function send_axios_request(url){
    var datas = '';
    var config = {
    method: 'get',
    url:`https://htmlweb.ru/analiz/api.php?whois&url=${url}&json`,
    headers: { },
    data : datas
    };

    const data = await axios(config)
    return data

}
export default router;