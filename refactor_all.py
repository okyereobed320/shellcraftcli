import json
import re
import os

def refactor_content(item):
    content = item.get('content', '')
    title = item.get('title', '')
    insight = item.get('insight', '')
    lab = item.get('lab', {})
    lab_cmd = lab.get('command', '')

    # Helper to clean text
    def clean(text):
        if not text: return ""
        text = text.strip().replace('**', '')
        # Remove any leading "- " or "* "
        if text.startswith('- ') or text.startswith('* '):
            text = text[2:].strip()
        return text

    # 1. Objective
    obj_match = re.search(r'LEARNING OBJECTIVE: (.*?)(?:\n|$)', content)
    objective = clean(obj_match.group(1)) if obj_match else title

    # 2. Concept Explanation
    concept = ""
    concept_match = re.search(r'(?:DETAILED EXPLANATION|CONCEPT|STANDARD ENVIRONMENT|FLEXIBLE ENVIRONMENT|WORKFLOW|PROBLEM|SOLUTION): ([\s\S]*?)(?=\n\n|\n[A-Z ]+:|$)', content)
    if concept_match:
        concept = clean(concept_match.group(1))
    else:
        parts = content.split('\n\n')
        for p in parts:
            if 'LEARNING OBJECTIVE' not in p and ':' not in p[:30] and len(p) > 30:
                concept = clean(p)
                break
    if not concept:
        concept = f"Detailed overview of {title} focusing on its role in GCP architecture and deployment workflows."

    # 3. Commands
    cmds = []
    cmd_section = re.search(r'(?:CLI EXAMPLES|COMMANDS):\n([\s\S]*?)(?=\n\n|\n[A-Z ]+:|$)', content)
    if cmd_section:
        for line in cmd_section.group(1).split('\n'):
            line = line.strip().replace('`', '')
            if line.startswith('- ') or line.startswith('* '):
                line = line[2:].strip()
            if ':' in line:
                parts = line.split(':')
                cmds.append(f"* `{parts[1].strip()}` # {parts[0].strip()}")
            elif line:
                cmds.append(f"* `{line}`")
    
    if lab_cmd:
        lab_entry = f"* `{lab_cmd}` # Practice command for {title}"
        if not any(lab_cmd in c for c in cmds):
            cmds.append(lab_entry)
    
    commands_str = "\n".join(cmds) if cmds else f"* No specific CLI commands for {title}."

    # 4. Use Case
    use_case_match = re.search(r'(?:WHY IT MATTERS|USE CASE|REAL-WORLD USE CASE): (.*?)(?:\n\n|\n[A-Z ]+:|$)', content)
    use_case = clean(use_case_match.group(1)) if use_case_match else f"Used by cloud engineers to manage {title} in production GCP environments."

    # 5. Common Mistakes
    mistake_match = re.search(r'(?:EXAM TIP|COMMON MISTAKES): (.*?)(?:\n\n|\n[A-Z ]+:|$)', content)
    mistakes = clean(mistake_match.group(1)) if mistake_match else f"Commonly misconfiguring {title} or misunderstanding its operational boundaries."

    # 6. Best Practice
    best_practice = clean(insight) if insight else f"Follow the principle of least privilege and resource isolation for {title}."

    # 7. Summary
    summary = ""
    summary_match = re.search(r'(?:SUMMARY POINTS|SUMMARY):\n*([\s\S]*?)(?=\n\n|\n[A-Z ]+:|$)', content)
    if summary_match:
        summary = clean(summary_match.group(1)).replace('\n', '. ')
        # Clean up bullet points in summary
        summary = re.sub(r'[\-\*]\s*', '', summary)
    else:
        summary = f"Mastered the core concepts and operational management of {title}."

    return f"""[OBJECTIVE]
{objective}

[CONCEPT EXPLANATION]
{concept}

[COMMANDS]
{commands_str}

[REAL-WORLD USE CASE]
{use_case}

[COMMON MISTAKES]
{mistakes}

[BEST PRACTICE]
{best_practice}

[SUMMARY]
{summary}"""

def process_file(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    for item in data:
        item['content'] = refactor_content(item)
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

files = [
    'data/cloud-platforms/handbook/gcp/ace/04_deployment.json',
    'data/cloud-platforms/handbook/gcp/ace/05_operations.json',
    'data/cloud-platforms/handbook/gcp/ace/06_security.json'
]

for f in files:
    process_file(f)
    print(f"Refactored {f}")
