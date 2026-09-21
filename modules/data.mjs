export class AppData {
    constructor(entries = null) {
        this.entries = entries ?? []; 
        console.log(entries)
    }
    
    orderEntries() {
        let day = 1000*60*60*24
        
        // using bubblesort going by the date, 
        // and then encorporating the priority
        // to schedule an amount of days prior
        for(let i = 0; i < this.entries.length; i++) {
            for(let j = 0; j < this.entries.length - i - 1; j++) {
            if(
                new Date(this.entries[j].deadline - this.entries[j].priority * day) > 
                new Date(this.entries[j + 1].deadline - this.entries[j+1].priority * day)
            ) {
                let temp = this.entries[j]
                this.entries[j] = entries[j+1]
                this.entries[j+1] = temp 
            } 
            }
        } 

        for(let i = 0; i < this.entries.length; i++) {
            this.entries[i].order = i; 
        }

        return this.entries; 
    }
}

export class Entry {
    constructor(entryname, deadline, priority) {
        this.entry = entryname;
        this.deadline = deadline;
        this.priority = priority;
    }

}