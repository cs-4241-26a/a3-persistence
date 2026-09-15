Assignment 3 - Persistence: Two-tier Web Application with Database, Express server, and CSS template
===

Due: September 15th, by 1:59 PM.

## Todo List Application

A link to your project running on render.
https://a3-owen-matthews.onrender.com

Include a very brief summary of your project here. Images are encouraged, along with concise, high-level text. Be sure to include:
This project is a todo list application with a goal to keep track of necessary tasks. This app allows users to log in, view their own tasks, edit tasks, delete tasks, attatch a priority (high, medium, low) and see when the deadline is for each task.

The user data and todo items are stored in MongoDb so that each user can only view their own tasks.
The main challenge was connecting the express server to MongoDb and making sure that each user could only access their own tasks.
I didn't use OAuth authentication due to time constraints. I just used a basic username/password system and created new users automatically

I used Bootstrap because it gave me layouts, accessable form controls, buttons, spacing, tables, without custom CSS. My CSS was only colors for the different priorities for tasks

Technologies: Node.js, Express, MongoDB, JavaScript, HTML, CSS, Bootstrap, Render

## Technical Achievements
<img width="1775" height="648" alt="Screenshot 2026-09-15 130812" src="https://github.com/user-attachments/assets/90ab7806-2e6f-4c1e-8892-f985399aeb5d" />
<img width="1662" height="632" alt="Screenshot 2026-09-15 130916" src="https://github.com/user-attachments/assets/4485b827-6828-4d0e-bcaf-f9f56634bbfc" />

The app was tested using Google Lighthouse for the login and main page.
Login Page - 100 for all
Main Page - 100 for all, except 99 for performance



### Design/Evaluation Achievements
I implemented 12 accessibility improvements based on the Web Accessibility Initiative recommendations.

Informative page titles: Both pages use descriptive titles that identify the purpose of the page.
Headings and structure: The application uses an h1 for the main page heading and h2 headings to organize sections of the application.
Labels for form controls: The task, priority, username, and password controls all have associated labels.
Semantic HTML: The application uses semantic header, main, and section elements to provide meaningful page structure.
Descriptive buttons: Dynamically generated Edit, Delete, Save, and Cancel buttons have descriptive accessible names.
Table caption: The todo table contains a caption describing the information presented by the table.
Table header scopes: Table headers use the scope="col" attribute so assistive technologies can associate table data with the correct columns.
Information does not rely on color alone: Priority is represented by the words High, Medium, and Low in addition to different colors.
Improved color contrast: Custom priority colors were changed from bright red, orange, and green to darker colors with stronger contrast against the background.
Accessible dynamic updates: An aria-live region communicates changes to the todo list to users using assistive technologies.
Keyboard-friendly controls: Interactive elements use native HTML form controls and buttons, allowing normal keyboard interaction.
Clear form instructions: Forms use visible labels and clear placeholder text, while the login page explains that an account is automatically created when a new username is entered.

**CRAP Principles**

**Contrast**
Contrast is used to make the most important information and actions easy to distinguish. On the login page, the main emphasis is the Log In heading and the primary Log In button. Bootstrap's primary button styling provides a strong visual contrast against the otherwise simple page. On the todo page, the Add Task button provides the strongest visual emphasis for the primary action, while Edit and Delete use different Bootstrap button styles so that users can distinguish between actions. Priority information also uses contrasting text colors and bold text. Importantly, the priority is written as High, Medium, or Low, so the user does not need to distinguish colors to understand the information. Headings are also visually larger than the surrounding text, creating a clear hierarchy between the page title, section title, form labels, and task information.

**Repetition**
Repetition is used throughout the application to make the interface predictable. Bootstrap's button, form, table, spacing, and typography styles are repeated across both pages. The same Bootstrap primary button style is used for the main actions, while secondary actions use appropriate outline or secondary styles. Form controls use the same Bootstrap styling so that the username, password, task, and priority controls have a consistent appearance. The page also consistently uses similar spacing around headings, forms, and sections. The priority system is repeated for every todo item so that users can quickly recognize the meaning of High, Medium, and Low. This repetition creates a consistent visual language across the login and todo pages and reduces the amount of new visual information users need to learn.

**Alignment**
Alignment is used to organize the application's information and make the interface easier to scan. The login form is contained within a centered, limited-width section, keeping the form visually focused and preventing excessive horizontal movement. On the todo page, Bootstrap's grid system aligns the task input, priority selector, and Add Task button into a single row on larger screens while allowing them to stack on smaller screens. The todo information is organized into aligned table columns, allowing users to compare task names, priorities, dates, and actions quickly. Consistent left alignment of most text also helps users follow information from one row to another. Buttons within the Actions column are grouped together, visually communicating that they affect the corresponding task. These alignment decisions help create a clean structure without requiring extensive custom CSS.

**Proximity**
Proximity is used to show which pieces of information and controls belong together. On the todo page, the task input, priority selection, and Add Task button are grouped together because they all contribute to creating a new task. The todo table then appears as a separate section containing the tasks that have already been created. Within each table row, the task, priority, creation date, deadline, and action buttons are positioned together so users can understand that the Edit and Delete buttons apply to that particular task. On the login page, each label is placed directly next to its associated input, making the relationship between the label and control clear. The username and password fields are also grouped within the same login form, while the account-creation explanation is positioned directly beneath the form. These proximity choices make the interface easier to understand and reduce visual clutter.
