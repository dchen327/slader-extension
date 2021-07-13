// TODO: Sidestep race condition in a less patchwork manner
setTimeout(function(){ renderBypass(); /* TODO: Check if it actually went through */ }, 1250);


function renderBypass()
{
    // Setup page elements
    
    //Get Katex CSS
    var katex_css = document.createElement('link');
    katex_css.setAttribute('rel','stylesheet');
    katex_css.setAttribute('href','https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css ');
    document.head.appendChild(katex_css);

    // Clear the "hidden explanation" out and replace it with a blank explanation area.
    // The innermost item is ".s1i7awl8"
    document.querySelector('main .mwhvwas').innerHTML = '<div class="c18oith1 sladerBypass"><div class="s1oluvjw"><h4 class="h1cwp1lk">Explanation</h4><div class="as7m9cv snqbbas"><div data-testid="ExplanationsSolution" class="e1sw891e"><div class="s1i7awl8"></div></div></div></div></div>';
    var expArea = document.querySelector('.sladerBypass .s1i7awl8')

    // Render new stuff

    // Get the webpage data, devoid of any headers or cookies. Acts as if the user is not logged in at all.
    var data = httpGet(window.location);

    // Is this an abomination? Yes.
    // Does it work? Also yes.
    //
    // ...
    // 
    // I don't want to talk about it.
    //
    var b = data.match(/(?<=window.Quizlet\["questionDetailsPageData"] = ).+?(?=; QLoad\("Quizlet.questionDetailsPageData")/gm);
    if (!b)
    {
        expArea.innerHTML = `<div style="color: red;"><h1>You have been ratelimited by Quizlet</h1><br>Try clearing your cookies for Quizlet.<br>— Slader Bypass</div>`;
    }

    // TODO: Branch off to handle textbookExercisePageData. See line 1349 in "deleteme.html".


    // Parse JSON data
    var qDetails = JSON.parse(b[0]);

    // Display JSON data as answer
    qDetails.question.solutions.forEach(solution => {
        const numSteps = solution.steps.length;
        solution.steps.forEach(step => {
            const stepNum = step.stepNumber;
            // Create card element
            var div = document.createElement('div');
            // Insert boilerplate card data
            div.innerHTML = '<div class="r8gl7vf" data-testid="ExplanationsSolutionStep" style="padding-top: 0.8rem;"><div class="AssemblyCard AssemblyMediumCard"><div class="ExplanationsSolutionCard c5ngj6s"><div class="h1ejaztj"><h4 class="s39tzu2"></h4><span class="sb9ch1t"></span></div><div class="s1wwu7g8"><div class="s1x7f4sz"><div class=""><div class="s1xkd811"><div class="mi4ni5d sladerBypassKatex" style="white-space: pre-wrap;"></div></div></div></div></div></div></div></div>';
            // Step X: .s39tzu2
            div.querySelector('.s39tzu2').innerHTML = (numSteps === stepNum) ? "Result" : "Step " + stepNum;
            // x of x: .sb9ch1t
            div.querySelector('.sb9ch1t').innerHTML = stepNum + ' of ' + numSteps;
            
            // I'm not 100% on the structure of these, but I'll take a stab at it.
            // It seems that only one column is ever used. I'll iterate anyways, because I can't trust that.
            step.columns.forEach(column => {
                // Insert inner text
                div.querySelector('.sladerBypassKatex').textContent = column.text.replaceAll('\n\n\n', '\n\n'); // The replace call is a bit funky but it works.

                // TODO: Handle column.images.additional
            });
            
            // Append card to explanation area.
            expArea.appendChild(div);
        });
    });

    // Render Katex for each card
    expArea.querySelectorAll('.sladerBypassKatex').forEach(textArea => {
        renderMathInElement(textArea, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\begin{equation}", right: "\\end{equation}", display: true},
                {left: "\\begin{align}", right: "\\end{align}", display: true},
                {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
                {left: "\\begin{gather}", right: "\\end{gather}", display: true},
                {left: "\\begin{CD}", right: "\\end{CD}", display: true},
                {left: "\\[", right: "\\]", display: true}
              ],
            throwOnError : false
        });    
    });
};



// Handle GET request
function httpGet(url)
{
    var req = new XMLHttpRequest();
    req.open( "GET", url, false ); // false -> synchronous request
    req.send( null );
    return req.responseText;
}
