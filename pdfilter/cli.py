import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TimeElapsedColumn, BarColumn, TextColumn
import os
import pymupdf as fitz
from .processor import process_pdf
from .filters import PRESETS

console = Console()

@click.command()
@click.argument('input_path', type=click.Path(exists=True))
@click.argument('output_path', type=click.Path(), required=False)
@click.option('--preset', type=click.Choice(list(PRESETS.keys())), help='Apply a predefined filter preset.')
@click.option('--plugin', type=click.Path(exists=True), help='Path to a custom Python plugin file.')
@click.option('--custom', is_flag=True, help='Enable custom filter parameters (contrast, brightness, saturation, invert).')
@click.option('--contrast', type=float, default=1.0, help='Contrast multiplier (default: 1.0).')
@click.option('--brightness', type=float, default=1.0, help='Brightness multiplier (default: 1.0).')
@click.option('--saturation', type=float, default=1.0, help='Saturation multiplier (default: 1.0).')
@click.option('--invert', is_flag=True, help='Invert colors.')
@click.option('--dpi', type=int, default=150, help='Resolution for rasterization (default: 150).')
def main(input_path, output_path, preset, plugin, custom, contrast, brightness, saturation, invert, dpi):
    """
    pdfilter: A concurrent command-line tool to apply visual filters to PDF documents.
    """
    if not output_path:
        base, ext = os.path.splitext(input_path)
        suffix = ""
        if preset:
            suffix = f"_{preset}"
        elif plugin:
            suffix = "_plugin"
        elif custom:
            suffix = "_custom"
        else:
            suffix = "_filtered"
        output_path = f"{base}{suffix}{ext}"
        
    filter_kwargs = {
        "preset": preset,
        "plugin_path": plugin,
        "is_custom": custom,
        "contrast": contrast,
        "brightness": brightness,
        "saturation": saturation,
        "invert": invert
    }
    
    # Validation
    active_modes = sum(bool(x) for x in [preset, plugin, custom])
    if active_modes > 1:
        console.print("[bold red]Error:[/] Please select only one mode: --preset, --plugin, or --custom.")
        raise click.Abort()
    if active_modes == 0:
        # If no mode selected but custom params are provided, assume custom
        if contrast != 1.0 or brightness != 1.0 or saturation != 1.0 or invert:
            filter_kwargs["is_custom"] = True
        else:
            console.print("[bold yellow]Warning:[/] No filter selected. The PDF will be rasterized without changes.")
            console.print("Use [bold cyan]--preset[/], [bold cyan]--plugin[/], or [bold cyan]--custom[/] to apply filters.")

    console.print(f"[bold green]Starting pdfilter[/]")
    console.print(f"Input: [bold]{input_path}[/]")
    console.print(f"Output: [bold]{output_path}[/]")
    console.print(f"DPI: [bold]{dpi}[/]")
    
    try:
        # Quick check for total pages for progress bar
        doc = fitz.open(input_path)
        total_pages = len(doc)
        doc.close()
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            TimeElapsedColumn(),
            console=console
        ) as progress:
            task = progress.add_task("[cyan]Processing pages...", total=total_pages)
            
            def update_progress():
                progress.advance(task)
                
            process_pdf(
                input_path=input_path,
                output_path=output_path,
                dpi=dpi,
                filter_kwargs=filter_kwargs,
                progress_callback=update_progress
            )
            
        console.print("[bold green]Success![/] PDF processed and saved.")
        
    except Exception as e:
        console.print(f"[bold red]An error occurred during processing:[/] {e}")
        raise click.Abort()

if __name__ == '__main__':
    main()
