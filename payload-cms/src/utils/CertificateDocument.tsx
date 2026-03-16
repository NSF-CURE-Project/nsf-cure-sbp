import React from 'react'
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

type CertificateDocumentProps = {
  fullName: string
  className: string
  issueDate: string
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#0F172A',
    paddingVertical: 42,
    paddingHorizontal: 52,
    justifyContent: 'space-between',
  },
  header: {
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 1.3,
    color: '#0F172A',
  },
  title: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 38,
    letterSpacing: 2.6,
    color: '#0B1324',
  },
  body: {
    marginTop: 26,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 1.55,
    color: '#1F2937',
  },
  strong: {
    fontFamily: 'Helvetica-Bold',
  },
  issueDate: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 13,
    color: '#334155',
  },
  footer: {
    marginTop: 36,
    textAlign: 'center',
    fontSize: 11,
    color: '#475569',
  },
})

export const CertificateDocument = ({ fullName, className, issueDate }: CertificateDocumentProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.frame}>
        <View>
          <Text style={styles.header}>NSF CURE Summer Bridge Program</Text>
          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.body}>
            This certifies that <Text style={styles.strong}>{fullName}</Text> has successfully
            completed <Text style={styles.strong}>{className}</Text>
          </Text>
          <Text style={styles.issueDate}>Issued on {issueDate}</Text>
        </View>
        <Text style={styles.footer}>NSF Award #2318258 · Cal Poly Pomona</Text>
      </View>
    </Page>
  </Document>
)
