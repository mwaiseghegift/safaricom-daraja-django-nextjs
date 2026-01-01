import os
from pathlib import Path

def combine_md_files(root_dir, output_file):
    """
    Combines all .md files in the root_dir (recursively) into a single output_file.
    Each file's content is prefixed with its relative path as a header.
    """
    root_path = Path(root_dir)
    md_files = list(root_path.rglob('*.md'))
    # Sort files by their relative path for consistent ordering
    md_files.sort(key=lambda x: x.relative_to(root_path))

    with open(output_file, 'w', encoding='utf-8') as outfile:
        for md_file in md_files:
            relative_path = md_file.relative_to(root_path)
            outfile.write(f'# {relative_path}\n\n')
            try:
                with open(md_file, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                    outfile.write(content)
            except Exception as e:
                outfile.write(f"Error reading file: {e}\n")
            outfile.write('\n\n---\n\n')  # Separator between files

if __name__ == '__main__':
    # Assuming the script is in backend/utils/, documentation is at project root
    project_root = Path(__file__).parent.parent.parent
    documentation_dir = project_root / 'documentation'
    output_file = documentation_dir / 'combined_documentation.md'
    combine_md_files(documentation_dir, output_file)
    print(f"Combined documentation saved to {output_file}")
