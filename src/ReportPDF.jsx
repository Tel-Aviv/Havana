import React, { useRef } from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { PDFViewer } from '@react-pdf/renderer';
import ReactToPrint from 'react-to-print';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }, 
  author: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 40,
  },  
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'Oswald'
  },  
  subtitle: {
    fontSize: 18,
    margin: 12,
    fontFamily: 'Oswald'
  },  
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: 'justify',
    fontFamily: 'Times-Roman'
  },  
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: 'grey',
  }, 
 pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },   
});

const ReportPDF = (props) => {

    const componentRef = useRef();

    return (<>
            <ReactToPrint
                trigger={() => <button>Print!</button>}
                content={() => componentRef.current}
            />
            <PDFViewer ref={componentRef}>
                <Document>
                    <Page size="A4" style={styles.page}>
                        <View style={styles.section}>
                            <Text>Section #1</Text>
                         </View>                    
                    </Page>
                </Document>
            </PDFViewer>
        </>)

}

export default ReportPDF;