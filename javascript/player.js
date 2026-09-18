class Player{
    constructor(user, total, correct){
        this.username = user;
        this.totalGuesses = total;
        this.correctGuesses = correct;
        this.percentage = correct/total;
    }

    toString(){
        return JSON.stringify(this.jsonify())
    }

    jsonify(){
        return {
            username: `${this.username}`,
            totalGuesses: `${this.totalGuesses}`,
            correctGuesses: `${this.correctGuesses}`,
            percentage: `${this.correctGuesses / this.totalGuesses}`
        }
    }
}

class Leaderboard{
    constructor(){
        this.board = []
    }

    sortLeaderboard(){
        this.board.sort((a,b) => a.correctGuesses - b.correctGuesses).reverse()
    }

    get(username){
        return this.board.find((element) => element.username === username)
    }

    correctAnswer(username){
        let currPlayer = this.get(username)
        if (currPlayer !== undefined){
            currPlayer.totalGuesses += 1;
            currPlayer.correctGuesses += 1;
            currPlayer.percentage = currPlayer.correctGuesses / currPlayer.totalGuesses
            }
            else{
            this.board.push(new Player(username, 1, 1))
        }

        this.sortLeaderboard()
    }

    incorrectAnswer(username){
        let currPlayer = this.get(username)
        if (currPlayer !== undefined){
            currPlayer.totalGuesses += 1;
            currPlayer.percentage = currPlayer.correctGuesses / currPlayer.totalGuesses
        }
        else{
            this.board.push(new Player(username, 1, 0))
        }
        this.sortLeaderboard()
    }
}

module.exports = {Player, Leaderboard}