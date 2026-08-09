from setuptools import setup, find_packages

with open("requirements.txt") as f:
    requirements = f.read().splitlines()

setup(
    name="pdfilter",
    version="1.0.0",
    description="A concurrent command-line tool to apply visual filters to PDF documents.",
    packages=find_packages(),
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "pdfilter = pdfilter.cli:main",
        ],
    },
    python_requires=">=3.8",
)
