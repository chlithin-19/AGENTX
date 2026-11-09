import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def test_helpers():
    doc = docx.Document()
    # Check styles
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(10)
    
    # Test table borders
    tbl = doc.add_table(rows=2, cols=2)
    tblPr = tbl._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="12" w:space="0" w:color="000000"/>
            <w:bottom w:val="single" w:sz="12" w:space="0" w:color="000000"/>
            <w:insideH w:val="single" w:sz="6" w:space="0" w:color="D3D3D3"/>
            <w:insideV w:val="none"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)
    
    # Test cell shading
    tcPr = tbl.cell(0, 0)._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F2F2F2"/>')
    tcPr.append(shd)
    
    doc.save('test_helpers.docx')
    print("Helpers test passed successfully!")

if __name__ == '__main__':
    test_helpers()
