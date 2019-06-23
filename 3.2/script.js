let nextUrl // to store the url of next page
let prevUrl // to store the url of previous page
let firstUrl // to store the url of first page
let lastUrl // to store the url of last page

/* To search the repo */
function searchFirst() {
    let url = 'https://api.github.com/search/repositories?per_page=10&q=' + $('#search').val()
    $('.loadRow').fadeOut()
    $('.buttons').css('display','flex')
    $('.recordTable').fadeIn()
    search(url)
}

/* To fetch the url, format and display the results
@Param url : url to fetch
*/
function search(url) {
    $('#loading').show()
    fetch(url, {
        headers: {
            'User-Agent': 'request'
        }
    })
        .then(res => {
            $('tbody').remove()
            nextUrl = ''
            prevUrl = ''
            firstUrl = ''
            lastUrl = ''
            const links = res.headers.get('Link').split(',')
            for (link of links) {
                link = link.trim()
                if (link.includes('next')) {
                    nextUrl = link.substring(1, link.indexOf('>'))

                }
                if (link.includes('last')) {
                    lastUrl = link.substring(1, link.indexOf('>'))

                }
                if (link.includes('first')) {
                    firstUrl = link.substring(1, link.indexOf('>'))

                }
                if (link.includes('prev')) {
                    prevUrl = link.substring(1, link.indexOf('>'))

                }
            }
            checkButtons(nextUrl, 'next')
            checkButtons(lastUrl, 'last')
            checkButtons(firstUrl, 'first')
            checkButtons(prevUrl, 'prev')
            return res.json()
        })
        .then(records => {
            tbody = document.createElement('tbody')
            $('table').append(tbody)
            let responses = []
            records.items.forEach(record => {
                let response = {}
                Promise.all([getOwnerDetails(record.owner.url), getNumberOfBranch(record.branches_url)])
                    .then(d => {
                        let tr = document.createElement('tr')
                        response['name'] = record.name
                        tr.appendChild(createTableData(response['name']))
                        response['full_name'] = record.full_name
                        tr.appendChild(createTableData(response['full_name']))
                        response['private'] = record.private
                        tr.appendChild(createTableData(response['private']))
                        response['owner'] = d[0]
                        tr.appendChild(createTableData(response['owner'].login))
                        tr.appendChild(createTableData(response['owner'].name))
                        tr.appendChild(createTableData(response['owner'].followersCount))
                        tr.appendChild(createTableData(response['owner'].followingCount))
                        response['licenseName'] = (record.license !== null) ? record.license.name : ''
                        tr.appendChild(createTableData(response['licenseName']))
                        response['score'] = record.score
                        tr.appendChild(createTableData(response['score']))
                        response['numberOfBranch'] = d[1]
                        tr.appendChild(createTableData(response['numberOfBranch']))
                        responses.push(response)
                        $('tbody').append(tr)
                        if (responses.length == records.items.length) {
                            $('#loading').hide()
                            console.log(responses)
                        }
                    })
                    .catch(e => {
                        $('#loading').hide()
                        console.error(e)
                    })
            });
        })
        .catch(e => {
            $('#loading').hide()
            console.error(e)
        })
}

/* To get the owner details
@Param : Owner url

@return : Promise
*/
function getOwnerDetails(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            headers: {
                'User-Agent': 'request'
            }
        })
            .then(res => res.json())
            .then(record => {
                let response = {}
                response['login'] = record.login
                response['name'] = record.name
                response['followersCount'] = record.followers
                response['followingCount'] = record.following
                return resolve(response)
            })
            .catch(e => reject(e))
    })
}

/* To get the number of branch
@Param : branch url

@return : Promise
*/
function getNumberOfBranch(url) {
    return new Promise((resolve, reject) => {
        url = url.slice(0, -9)
        fetch(url, {
            headers: {
                'User-Agent': 'request'
            }
        })
            .then(res => res.json())
            .then(record => {
                return resolve(record.length)
            })
            .catch(e => reject(e))
    })
}

/* To check the page urls and buttons and change the disability accordingly
@Param url : Page url
@Param id : Button id
*/
function checkButtons(url, id) {
    if (url != '') {
        $('#' + id).removeAttr('disabled')
    } else {
        $('#' + id).attr('disabled', true)
    }
}

/* Page buttons start */
function next() {
    search(nextUrl)
}

function last() {
    search(lastUrl)
}

function first() {
    search(firstUrl)
}

function prev() {
    search(prevUrl)
}
/* Page buttons ends */

/* To create table data element
@Param text : Text to be entered in table data element

@return : Html td element
*/
function createTableData(text){
    let td = document.createElement('td')
    td.textContent = text
    return td
}