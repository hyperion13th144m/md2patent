export const patentMarkdownGrammar = `
    PatentMarkdown {
        doc = blank* description claims abstract
        description = descHeader invention techField bgArt citations summaryOfInvention summaryOfDrawings? descriptionOfEmbodiments industrialApplicability? refSigns?
        claims = blank*
        abstract = blank*

        descHeader = "#" sp* "【書類名】" sp* "明細書" block+

        invention = inventionHeader inventionContent blank*
        inventionHeader = "##" sp* "【発明の名称】" sp* nl
        inventionContent = block+

        techField = techFieldHeader techFieldContent blank*
        techFieldHeader = "##" sp* "【技術分野】" sp* nl
        techFieldContent = block+ 

        bgArt = bgArtHeader bgArtContent
        bgArtHeader = "##" sp* "【背景技術】" sp* nl
        bgArtContent = block+

        citations = citationsHeader blank* patentCitations blank* nonPatentCitations blank*
        citationsHeader = "##" sp* "【先行技術文献】" sp*
        patentCitations =  patentCitationsHeader blank* patentCitationList
        patentCitationsHeader = "###" sp* "【特許文献】" blank*
        patentCitationList = bullet+ 
        nonPatentCitations = nonPatentCitationsHeader blank* nonPatentCitationList
        nonPatentCitationsHeader = "###" sp* "【非特許文献】" sp*
        nonPatentCitationList = bullet* 

        summaryOfInvention = summaryOfInventionHeader blank* techProblem blank* techSolution blank* advantageousEffect?
        summaryOfInventionHeader = "##" sp* "【発明の概要】" sp*
        techProblem = techProblemHeader blank* techProblemContent
        techProblemHeader = "###" sp* "【発明が解決しようとする課題】" blank*
        techProblemContent = block+
        techSolution = techSolutionHeader blank* techSolutionContent
        techSolutionHeader = "###" sp* "【課題を解決するための手段】" blank*
        techSolutionContent = block+
        advantageousEffect = advantageousEffectHeader blank* advantageousEffectContent
        advantageousEffectHeader = "#"+ sp* "【発明の効果】" blank*
        advantageousEffectContent = block+

        summaryOfDrawings =  summaryOfDrawingsHeader blank* summaryOfDrawingsList blank*
        summaryOfDrawingsHeader = "##" sp* "【図面の簡単な説明】" blank*
        summaryOfDrawingsList = bullet+ 

        descriptionOfEmbodiments = descriptionOfEmbodimentsHeader descriptionOfEmbodimentsContent blank*
        descriptionOfEmbodimentsHeader = "##" sp* "【発明を実施するための形態】" blank*
        descriptionOfEmbodimentsContent = block2+
        embodimentsExample = "#"+ sp* "【実施例】" blank*

        industrialApplicability =  industrialApplicabilityHeader blank* industrialApplicabilityContent blank*
        industrialApplicabilityHeader = "##" sp* "【産業上の利用可能性】" blank*
        industrialApplicabilityContent = block+ 
 
        refSigns =  refSignsHeader blank* refSignsContent blank*
        refSignsHeader = "##" sp* "【符号の説明】" blank*
        refSignsContent = block+ 

        bullet = "* " rest (~"*" ~blank rest)*
        block =  blank | para | endline
        block2 =  blank | para | endline | embodimentsExample
        blank = sp* nl  // blank line has only newline
        para = line+ //paragraph is just multiple consecutive lines
        endline = (~nl any)+ end
        line = ~"#" (~nl any)+ nl  // line has at least one letter
        nl = "\\n" | "\\r\\n" | "\\r"
        sp = " "
        rest = (~nl any)* nl  // everything to the end of the line
    }
 `;
