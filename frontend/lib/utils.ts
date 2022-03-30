type QueryParam = string | string[] | undefined

export function validateQueryParams(merkleRoot: QueryParam , userId: QueryParam, serverId: QueryParam){
    if(merkleRoot !== undefined && userId !== undefined && serverId !== undefined){
        // add more validation based on what we need
        return true
    } else {
        return false
    }
}