# **App Name**: MetalMetrica

## Core Features:

- Calculation Modes: Enable single and project calculation modes for steel weight estimation.
- Unit Conversion: Allow users to input steel dimensions in both metric and imperial units.
- PDF Report Generation: Generate formatted PDF reports for project calculations, including organization info and project details.
- Project Management: Enable the storage and management of project calculations.
- Calculation History & Templates: Allow saving and re-using templates
- Material Cost Estimation: Allow user to input steel price per unit (kg, ton, or lbs), calculate cost per piece and total cost per project, display cost alongside weight in both single and project calculation modes, and include cost in exported PDF reports with totals.
- Advanced Units & Density Selection: Users can select steel type (MS, SS, or custom) to adjust density, inputs can be in metric (mm, m, kg, ton) or imperial units (inches, ft, lbs), and conversion must automatically reflect in calculations and PDF reports.
- First Launch Organization Setup: On first app open, prompt user for organization name and optional logo, store this information for use in PDF headers, project reports, and app-wide branding, and allow editing organization info later in settings.
- Totals & Summaries: Project mode must calculate total weight per steel type (plates, girders, pipes, circular sections), overall project total weight, and total project cost (if material cost estimation enabled), display totals clearly in UI and include them in PDF exports.

## Style Guidelines:

- Main buttons, highlights, and active tabs should use a steel/industrial blue. Hex: #4682B4
- Headers, navigation bars, and secondary icons: Dark Slate Gray #2F4F4F
- Success / calculated values: Emerald Green #2ECC71
- Warnings / incomplete inputs: Orange #FFA500
- Errors / invalid inputs: Crimson Red #DC143C
- Main background: White Smoke #F5F5F5
- Card / container: White #FFFFFF
- Light sections / alternate backgrounds: Light Gray #E0E0E0
- Primary text: Dark Charcoal #333333
- Secondary text / labels: Gray #666666
- Headers / titles: Black #000000
- Font: 'Inter', a grotesque-style sans-serif, providing a modern and clean look suitable for both headlines and body text.
- Use icons related to steel types (plates, girders, pipes) with a modern, geometric style for clarity and ease of recognition.
- Maintain a clear, modular layout, ensuring each calculation type is easily accessible with prominent input fields and straightforward controls.