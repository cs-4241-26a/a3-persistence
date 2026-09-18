## Recipe Wiki

James Ostermiller<br>
https://a3-jamesostermiller.onrender.com/login.html

My project is a website which allows you to make an account and upload recipes, and see all of the recipes which other people have uploaded. The authentication strategy uses cookies to track your login, storing the user id and a "logged in" flag. I used the "PureCSS" framework for my main layout, but since it's a fairly minimal framework, it required some custom css for laying out the recipe cards. I also wrote custom css to apply my own fonts and colors to most elements, and to center a few things.

## Technical Achievements
- **Tech Achievement 1**: I got 100% in all four of the lighthouse tests (Performance, Accessibility, Best Practices, and SEO), running the test on my index.html page: https://pagespeed.web.dev/analysis/https-a3-jamesostermiller-onrender-com-index-html/9lbig5gf01?form_factor=desktop. I didn't have to do anything special for performance or best practices, but I did have to fix several contrast issues for the accessibility test and add meta tags to my pages for the SEO test.

### Design/Evaluation Achievements
- **Design Achievement 1**: I followed the following tips from the W3C Web Accessibility Initiative:
  1. "Developing": Associate a label with every form control
  2. "Developing": Identify page language and language changes
  3. "Developing": Use mark-up to convey meaning and structure
  4. "Developing": Write code that adapts to the user’s technology
  5. "Developing": Ensure that all interactive elements are keyboard accessible
  6. "Designing": Provide sufficient contrast between foreground and background
  7. "Designing": Ensure that interactive elements are easy to identify
  8. "Designing": Provide clear and consistent navigation options
  9. "Designing": Ensure that form elements include clearly associated labels
  10. "Designing": Create designs for different viewport sizes
  11. "Writing": Provide informative, unique page titles
  12. "Writing": Use headings to convey meaning and structure
  
- **Design Achievement 2**:
  - **Contrast**: I used color contrast to emphasize the difference between the navigation bar, which has a light background, and the rest of the content, which has a darker green background. Within that green background, I used a contrast between a lighter green (with dark text) and a darker green (with light text) to emphasize the recipes section and differentiate it from the form section. Within the header, I used the same dark green to provide contrast between links which are not being hovered and those that are; and I put a square box around the link to the current page, in contrast to all of the links which have no border at all. I also used contrast between font styles and sizes to put emphasis on the headers; the main text is in a serif font, while the headers are in a serif font. The larger section headers further have a size contrast, while the recipe names are differentiated mostly by font style.

  - **Repetition**: I used only 6 colors in my application, which are repeated through the various elements on each page. For example, the same cream color is used in the header, the background of the input elements, for any light text, and as the background of the time lines in the recipe cards. Each recipe card is also constructed in the same way, with the same elements and the same colors. Across pages, I have the same header on each page, and while it has different links depending on the page, pages with the same links have them in the same place and order. All form input elements look the same across all of my pages (same background, width, etc.), and the "form" sections of each page also have the same background color. The recipe cards are similarly almost the same between the main "browse recipes" page and the "my recipes" page, except that one shows the author and the other has a delete button. I use only two fonts throughout the applications, one of which is used across all of the body text and the other which is used for all of the headers, and although they are different styles, they are both monospace fonts for further consistency.

  - **Alignment**: For the forms, I aligned all the input elements with each other on both sides, and right-aligned the labels to match the left side of the input elements. The form as a whole is centered on the page/section, along with the header above the form. The header above the recipes is also centered, which increases the contrast between that and the left-aligned text of the recipe cards, while lining up with the gap between the ingredients and steps of each recipe. Within each recipe card, the header and author or delete button are aligned with the left edge of the time and ingredients sections, and the text inside those sections are aligned with each other. The actual time is right-aligned to make it easier to scan (providing more contrast between the time and the label).

  - **Proximity**: I grouped all the links to other pages together in a header to differentiate them from the rest of the content. For the form elements with units (the time fields), I grouped the units with them on the same line and close together to associate them. Similarly, the form elements as a whole are grouped together to differentiate them from the other sections of the page. In the recipe section, the recipes are displayed as a group, and within that group, each recipe is grouped together to associate the elements of that recipe with each other (using different-colored backgrounds to assist with this). The time fields are slightly closer together to each other than they are to the other elements of the recipe, which is subtle but helps establish them as showing related information. The details of the recipe are also indented slightly compared to the title and author, which helps set the title and author apart slightly.