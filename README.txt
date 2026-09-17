Frank's Illustrious Calculator Mk. II
Render link:
https://a3-frank-santen.onrender.com

Notice of lateness: Yesterday, I knew I was gonna be submitting this late. I asked Charlie 
Roberts whether I could have the rest of the night to finish the project instead of submitting 
at 2pm, and he said that was okay. Unfortunately, I didn't finish yesterday night, and I'm turning
this in late. Well, it was already gonna be late, but an okay amount of late, but this is a day 
later than the late that was okayed, but hopefully it's still fine?

This project was a modification of my A2 project, making it work with Express and MongoDB. 
User accounts were added to give individual users different histories and data, and MongoDB 
ensures that the data persists even if the server crashes. A simple login page was created 
to handle user account logins, because that seemed like the most intuitive system to me. 
The user's login was maintained as a session cookie, which was surprisingly easy to do. 
One challenge I faced is that the default code would replace any page sent by the server 
with the login html page if the user was unauthenticated, meaning the login page's javascript 
file mysteriously didn't get delivered when I wasn't logged into something. That was an annoying 
bug to trace back to its source, but I eventually found it and patched it out. For my CSS template, 
I chose Pico-css because it was similar to how I custom styled the page originally. I don't 
really like the template as much as my custom css, the template feels a lot more corporate 
and sanitized. Still, I didn't mess with it because the instructions encouraged me not to. 

### TECHNICAL ACHIEVEMENTS ###
Achieved 100% on all google lighthouse tests. Proof can be found in the two images 
"lighthouse-index.jpg" and "lighthouse-main.png". This was particularly difficult because of the 
requirement that page elements shouldn't shift without user input. My previous design relied 
on the main body being quickly fetched and loaded, but this bumped the footer downwards in a 
way that Lighthouse didn't like. It was quite finnicky to fix, I ended up needing to generate 
the footer in JS only after the main body could be loaded. 

Used 5 different Express middleware packages:
- cookie-session: Allowed for users to refresh the page and stay logged in to their account. 
- serve-favicon: Easy way to serve a favicon to both pages with minimal hassle. I made a crude calculator icon in ms paint for it. 
- morgan: A simple HTTP request logger for the server, made events easier to trace
- compression: Gzipped every file sent out to reduce network traffic with zero hassle. 
- response-time: Added a line to the header of every outgoing HTTP request telling the client how long it took the server to think. 

### DESIGN ACHIEVEMENTS ###
Here is how I followed the CRAP principles, in a minimum of 125 words per paragraph:

Contrast: In my original css, I believe that I did a great job with the two fonts contrasting. The font for <strong> elements 
(typically surrounding the word “ILLUSTRIOUS”) was fancy and weird and bold in contrast with the standard font elsewhere. This 
was lost somewhat with the pre-made css stylesheet, and the <strong> elements only slightly stick out now, which is a shame. The 
buttons have a lot of contrast, being sharply blue whereas the rest of the page is quite muted and dark. This helps guide the 
user’s eyes to where they can meaningfully interact with the page. In addition, the different background color for each individual 
calculation result helps differentiate them from both the header and footer as well as each other. The clear divide of color between 
calculations greatly helps with ease of reading, as you don’t get confused as to what elements are supposed to be grouped together. 

Proximity: The page can be easily divided into three sections because relevant pieces are grouped. All the information about the 
page is together at the top, all the data is arrayed back to back in the middle, and everything to add new data is at the bottom. 
This subconsciously hints to the user that new data will be added to the bottom of the site, as that’s where a new entry could appear 
that is closest to the entry fields. In addition, there is no ambiguity for what each edit / delete button changes, because it is 
placed directly within the box that has the data that it can edit / delete. Similarly, the “QUERY THE ILLUSTRIOUS CALCULATOR” button 
would be vague, except that it is placed directly below two text inputs that ask for two numbers to multiply. This easily informs the 
user that the query button will do something with those entries, aka add a piece of data to the main block. 

Repetition: There is a repeated invocation of the word “Illustrious” when referring to the calculator, and I think I used this to 
good comedic effect. The lack of explanation alongside the evident imprecision and incompetence of the calculator makes for a funny 
recurring bit, and informs the user that the “Illustrious comment” is both a comment directly from the calculator and not to be exactly 
trusted. The three repeated disclaimers are for comedic effect as well: good comedy comes in threes, and it reinforces the infomercial-like 
silliness of the website to have so many disclaimers about how it may or may not work. The final repeating element is the main body with 
all its data points. The repetition of data fields here suggests to the user that this is the main section of the page and the data fields 
are what you should be looking at and interacting with most of the time. 

Alignment: The alignment of the header vs. the main body vs. the footer came out well. The header is all aligned to the left side of the 
screen, but each data field in the main section has a certain amount of padding to the left side. This creates the effect of the data 
being indented, creating an invisible margin line that’s distinctly different from the header and thus establishes the data fields as 
their own thing. This comes into play again at the footer of the page, where the text once again becomes aligned to the left side of 
the screen. This creates a connection between the footer and the header, making them feel like they would be together if the data fields 
weren’t present in between them. I also play with the lack of alignment that comes with the floating-point results of the calculator. 
You would expect the numbers to line up nicely or at least to have a consistent amount of decimal points. The fact that they don’t is 
unexpected, therefore funny. 
