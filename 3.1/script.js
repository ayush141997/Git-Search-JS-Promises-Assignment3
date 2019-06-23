$(document).ready(() => {
    $.ajax({
        url: 'battles.json',
        method: 'get',
        beforeSend: function () {
            $('#loading').show();
        },
        complete: function () {
            $('#loading').hide();
        },
        success: (res) => {
            let response = {}
            Promise.all([mostActive(res), attackerOutcome(res), battleType(res), defenderSize(res)])
                .then(d => {
                    response['most_active'] = d[0]
                    response['attacker_outcome'] = d[1]
                    response['battle_type'] = d[2]
                    response['defender_size'] = d[3]
                    console.log(response)

                    for(let el in response['most_active']){
                        $('#mostActive').append('<p class="card-text">'+ el +' : '+ response['most_active'][el] +'</p>')
                    }
                    for(let el in response['attacker_outcome']){
                        $('#attackerOutcome').append('<p class="card-text">'+ el +' : '+ response['attacker_outcome'][el] +'</p>')
                    }
                    for(let el in response['battle_type']){
                        $('#battleType').append('<p class="card-text">'+ el +' : '+ response['battle_type'][el] +'</p>')
                    }
                    for(let el in response['defender_size']){
                        $('#defenderSize').append('<p class="card-text">'+ el +' : '+ response['defender_size'][el] +'</p>')
                    }                    
                })
                .catch(e => console.log(e))
        }
    })
})

/* Get count of duplicate values in an array
@Param keyArray : Array in which count of duplicate values has to be found

@return count : Object containing count of each unique value
*/
async function getCount(keyArray) {
    let count = {}
    await keyArray.forEach(b => {
        count[b] = (count[b] || 0) + 1
    })
    return count
}

/* Get max count of duplicate values in an array
@Param keyArray : Array in which max count of duplicate values has to be found

@return : key having max count
*/
async function getKeyOfMax(keyArray) {
    let count = await getCount(keyArray)
    let sorted = await Object.keys(count).sort((a, b) => {
        return count[b] - count[a]
    })
    return sorted[0]
}

/* To find the most active field
@Param battle : input json

@return : Object having different most active keys
*/
async function mostActive(battle) {
    const attackerKing = battle.map(o => o.attacker_king)
    const defenderKing = await battle.map(o => o.defender_king)
    const regions = await battle.map(o => o.region)
    const name = await battle.map(o => o.name)
    let mostActive = {}
    mostActive['attacker_king'] = await getKeyOfMax(attackerKing)
    mostActive['defender_king'] = await getKeyOfMax(defenderKing)
    mostActive['region'] = await getKeyOfMax(regions)
    mostActive['name'] = await getKeyOfMax(name)
    return mostActive
}

/* To find the attacker outcome field
@Param battle : input json

@return : Object having wins and losses keys
*/
async function attackerOutcome(battle) {
    let attackerOutcomes = await battle.map(o => o.attacker_outcome)
    let attackerOutcome = await getCount(attackerOutcomes)
    delete attackerOutcome[''] //to delete the empty key from object

    return attackerOutcome
}

/* To find the unique battle type
@Param battle : input json

@return : Array of unique battle types
*/
async function battleType(battle) {
    let battleTypes = await battle.map(o => o.battle_type)
    const uniqueBattleTypes = new Set(battleTypes)
    uniqueBattleTypes.delete('')
    let battleType = []
    await uniqueBattleTypes.forEach(a => battleType.push(a))

    return battleType
}

/* To find the stats about defender size
@Param battle : input json

@return : Object having different stats of defender size
*/
async function defenderSize(battle) {
    let defenderSizes = await battle.map(o => o.defender_size)
    let average = parseFloat((defenderSizes.reduce((p, c) => p + c, 0) / defenderSizes.length).toFixed(2))
    defenderSizes = defenderSizes.filter(d => d !== null)
    let defenderSize = {}
    defenderSizes.sort((a, b) => a - b)
    defenderSize['average'] = average
    defenderSize['min'] = defenderSizes[0]
    defenderSize['max'] = defenderSizes[defenderSizes.length - 1]

    return defenderSize
}



