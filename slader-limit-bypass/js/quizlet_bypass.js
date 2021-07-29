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

    // Get the webpage data, devoid of any headers or cookies. Acts as if the user is not logged in at all.
    doFetch(window.location).then(data => { processData(data); })

}
function processData(data){
    // Clear the "hidden explanation" out and replace it with a blank explanation area.
    // The innermost item is ".s1i7awl8"
    document.querySelector('main .mv7e89c').innerHTML = '<div class="c18oith1 sladerBypass"><div class="s1oluvjw"><h4 class="h1cwp1lk">Explanation</h4><div class="as7m9cv snqbbas"><div data-testid="ExplanationsSolution" class="e1sw891e"><div class="s1i7awl8"></div></div></div></div></div>';
    var expArea = document.querySelector('.sladerBypass .s1i7awl8')

    // Render new stuff

    // Is this an abomination? Yes.
    // Does it work? Also yes.
    //
    // ...
    // 
    // I don't want to talk about it.
    //
    var json = data.match(/(?<=window.Quizlet\["(questionDetailsPageData|textbookExercisePageData)"] = ).+?(?=; QLoad\("Quizlet.(questionDetailsPageData|textbookExercisePageData)")/gm);
    if (!json)
    {
        // Display ratelimit message
        expArea.innerHTML = `<div style="color: red;"><h1>You have been ratelimited by Quizlet</h1><br>Try clearing your cookies for Quizlet and reloading this page, this usually fixes it.<br>— Slader Bypass.</div>`;
    }

    // Parse JSON data
    var qDetails = JSON.parse(json[0]);
    var solutions = (qDetails.question || qDetails.exercise).solutions;
    // Display JSON data as answer
    solutionNum = 0;
    solutions.forEach(solution => {
        solutionNum++;
        expArea.appendChild(document.createElement('hr'));
        var h1 = document.createElement('h1');
        h1.textContent = 'Solution ' + solutionNum + ":";
        expArea.appendChild(h1);

        const numSteps = solution.steps.length;
        solution.steps.forEach(step => {
            const stepNum = step.stepNumber;
            // Create card element
            var div = document.createElement('div');
            // Insert boilerplate card data
            div.innerHTML = '<div class="r8gl7vf" data-testid="ExplanationsSolutionStep" style="padding-top: 0.8rem;"><div class="AssemblyCard AssemblyMediumCard"><div class="ExplanationsSolutionCard c5ngj6s"><div class="h1ejaztj"><h4 class="s39tzu2"></h4><span class="sb9ch1t"></span></div><div class="s1wwu7g8"><div class="s1x7f4sz"><div class=""><div class="s1xkd811" style="line-height: auto"><div class="mi4ni5d sladerBypassKatex" style="white-space: pre-wrap;"></div></div></div></div></div></div></div></div>';
            // Step X: .s39tzu2
            div.querySelector('.s39tzu2').textContent = (numSteps === stepNum) ? "Result" : "Step " + stepNum;
            // x of x: .sb9ch1t
            div.querySelector('.sb9ch1t').textContent = stepNum + ' of ' + numSteps;
            
            // I'm not 100% on the structure of these, but I'll take a stab at it.
            // It seems that only one column is ever used. I'll iterate anyways, because I can't trust that.
            step.columns.forEach(column => {
                var columnDiv = document.createElement('div');
                // Insert inner text
                if (column.text)
                {
                    var textDiv = document.createElement('div');
                    textDiv.classList.add('sladerBypassKatexTextArea');
                    textDiv.textContent = column.text.replaceAll('\n\n\n', '\n\n'); // The replace call is a bit funky but it works.
                    columnDiv.appendChild(textDiv);
                }
                // Insert image, if applicable
                if (column.images.additional)
                {
                    var image = document.createElement('img');
                    image.setAttribute('src', column.images.additional.regular.srcUrl);
                    columnDiv.appendChild(image);
                }
                // Append server-rendered image src url. Used in errorhandling. (See: handleKatexError())
                if (column.images.latex && column.images.latex.large)
                {
                    div.querySelector('.sladerBypassKatex').setAttribute('katexsrc', column.images.latex.large.srcUrl);
                }

                // handle hasInvalidKatex
                if(column.hasInvalidKatex)
                    div.querySelector('.sladerBypassKatex').setAttribute('InvalidKatex', "true");
                
                div.querySelector('.sladerBypassKatex').appendChild(columnDiv);
            });
            
            // Append card to explanation area.
            expArea.appendChild(div);
        });
    });

    // Render Katex for each card
    expArea.querySelectorAll('.sladerBypassKatex').forEach(textArea => {
        try {
            if(!textArea.hasAttribute("InvalidKatex")){
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
                    throwOnError : true,
                    errorCallback : function(a, b){ handleKatexError(a, b, textArea); }
                });
            }
            else{
                // sometimes even hasInvalidKatex, textArea still can render without error
                handleKatexError("hasInvalidKatex","hasInvalidKatex", textArea);
            }
        } catch (error) {
            console.error('Katex experienced an error. Attempting to load image replacement.');
        }
    });
};

function handleKatexError(a, b, textArea)
{
    // Display Katex error
    console.error(a);
    console.error(b);

    // Remove broken Katex
    textArea.querySelector('.sladerBypassKatexTextArea').innerHTML = '';

    // Fallback to server-rendered katex (I'm assuming they have better error detection there.)
    var image = document.createElement('img');
    image.setAttribute('src', textArea.getAttribute('katexsrc'));
    textArea.appendChild(image);
}

async function doFetch(url)
{
    const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'omit', // include, *same-origin, omit
        headers: {
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: null // body data type must match "Content-Type" header
    });
    return response.text();
}
