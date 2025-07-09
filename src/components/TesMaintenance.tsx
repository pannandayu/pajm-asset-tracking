// components/BendingMachineChecklistPDF.tsx
import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f2f2f2",
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  machineInfoTable: {
    width: "100%",
    marginBottom: 20,
  },
  machineInfoRow: {
    flexDirection: "row",
  },
  machineInfoLabel: {
    width: "20%",
    fontWeight: "bold",
    padding: 3,
  },
  machineInfoValue: {
    width: "30%",
    padding: 3,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  notes: {
    marginTop: 20,
    fontSize: 9,
  },
  approvalSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  approvalBox: {
    width: "30%",
    marginTop: 40,
  },
});

interface BendingMachineChecklistPDFProps {
  data: {
    date: string;
    technician: string;
    // Add other fields as needed
  };
}

const BendingMachineChecklistPDF: React.FC<BendingMachineChecklistPDFProps> = ({
  data,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Daily Maintenance Checklist
          </Text>
          <Text style={styles.companyName}>
            PT. Pemalang Aji Jaya Maritimindo
          </Text>
        </View>

        {/* Machine Information */}
        <View style={styles.machineInfoTable}>
          <View style={styles.machineInfoRow}>
            <Text style={styles.machineInfoLabel}>Mesin</Text>
            <Text style={styles.machineInfoValue}>: Bending Machine</Text>
            <Text style={styles.machineInfoLabel}>Tanggal</Text>
            <Text style={styles.machineInfoValue}>: {data.date}</Text>
          </View>
          <View style={styles.machineInfoRow}>
            <Text style={styles.machineInfoLabel}>Kode</Text>
            <Text style={styles.machineInfoValue}>: MC-1</Text>
            <Text style={styles.machineInfoLabel}>Teknisi / Tim</Text>
            <Text style={styles.machineInfoValue}>: {data.technician}</Text>
          </View>
          <View style={styles.machineInfoRow}>
            <Text style={styles.machineInfoLabel}>Merek</Text>
            <Text style={styles.machineInfoValue}>: CIMT</Text>
            <Text style={styles.machineInfoLabel}>Jenis</Text>
            <Text style={styles.machineInfoValue}>
              : Preventive Maintenance
            </Text>
          </View>
          <View style={styles.machineInfoRow}>
            <Text style={styles.machineInfoLabel}>Model</Text>
            <Text style={styles.machineInfoValue}>: WCGYY-600T/6000</Text>
            <Text style={styles.machineInfoLabel}>No. Checklist</Text>
            <Text style={styles.machineInfoValue}>: </Text>
          </View>
          <View style={styles.machineInfoRow}>
            <Text style={styles.machineInfoLabel}>No. Mesin</Text>
            <Text style={styles.machineInfoValue}>: 2206949</Text>
            <Text style={styles.machineInfoLabel}>Versi</Text>
            <Text style={styles.machineInfoValue}>: 1</Text>
          </View>
          <View style={styles.machineInfoRow}>
            <Text style={styles.machineInfoLabel}>Lokasi</Text>
            <Text style={styles.machineInfoValue}>: Workshop 2</Text>
            <Text style={styles.machineInfoLabel}>Dibuat Oleh</Text>
            <Text style={styles.machineInfoValue}>: 龙 (Asset Control)</Text>
          </View>
        </View>

        <View
          style={{ height: 1, backgroundColor: "#000", marginVertical: 10 }}
        />

        {/* Control Panel Section */}
        <Text style={styles.sectionTitle}>Panel Kontrol</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Tipe</Text>
            <Text style={styles.tableColHeader}>Kegiatan</Text>
            <Text style={styles.tableColHeader}>Jawaban</Text>
            <Text style={styles.tableColHeader}>Komentar</Text>
          </View>

          {/* Table Rows */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>
              Layer, Tangkai, Landsan, dan Area Sekitar
            </Text>
            <Text style={styles.tableCol}>Telah Dilakukan</Text>
            <Text style={styles.tableCol}>☉ Telah Dilakukan</Text>
            <Text style={styles.tableCol}></Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Tombol-Tombol</Text>
            <Text style={styles.tableCol}>
              Periksa fungsionalitas tombol-tombol, catat yang tidak berfungsi
            </Text>
            <Text style={styles.tableCol}>☉ Ada ☉ Tidak Ada</Text>
            <Text style={styles.tableCol}></Text>
          </View>

          {/* Add more rows as needed */}
        </View>

        {/* Electrical Section */}
        <Text style={{ ...styles.sectionTitle, marginTop: 20 }}>
          Kelistrikan
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 10 }}>
          Bagian ini dapat dilaksanakan sehingga menjalankan maintenance bagian
          Pisau dan Pondasi Bending.
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Tegangan Input Power Supply</Text>
            <Text style={styles.tableCol}>
              Catat dari panel box utama menggunakan multimeter
            </Text>
            <Text style={styles.tableCol}>V Normal / Abnormal</Text>
            <Text style={styles.tableCol}></Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Ampere Motor Utama</Text>
            <Text style={styles.tableCol}></Text>
            <Text style={styles.tableCol}>A Normal / Abnormal</Text>
            <Text style={styles.tableCol}></Text>
          </View>
        </View>

        {/* Blade and Foundation Section */}
        <Text style={styles.sectionTitle}>Pisau dan Pondasi Bending</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Limit Switch</Text>
            <Text style={styles.tableCol}>
              Pastikan pisau bergerak perlahan dan stabil setelah menyentuh
              limit switch
            </Text>
            <Text style={styles.tableCol}>☉ Berfungsi ☉ Tidak Berfungsi</Text>
            <Text style={styles.tableCol}></Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Pisau Bending</Text>
            <Text style={styles.tableCol}>Periksa kelurusan tiap ujung</Text>
            <Text style={styles.tableCol}>☉ Lurus ☉ Tidak Lurus</Text>
            <Text style={styles.tableCol}></Text>
          </View>
        </View>

        {/* Lubrication Section */}
        <Text style={styles.sectionTitle}>Pelumasan</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Level Oil</Text>
            <Text style={styles.tableCol}>
              Periksa level oil dari oil filter cap/opening
            </Text>
            <Text style={styles.tableCol}>☉ Cukup ☉ Perlu Ditambah</Text>
            <Text style={styles.tableCol}></Text>
          </View>
        </View>

        <Text style={{ fontSize: 9, marginTop: 10 }}>
          Diletankan untuk menjalankan proses pembersihan dan pelumasan tiap
          bulannya.
        </Text>

        {/* Approval Section */}
        <View style={styles.approvalSection}>
          <View style={styles.approvalBox}>
            <Text>Diperiksa Oleh:</Text>
            <Text style={{ marginTop: 30 }}>_________________________</Text>
            <Text>Hami Bahario</Text>
            <Text>Facility Support Head</Text>
          </View>
          <View style={styles.approvalBox}>
            <Text>Diketahui Oleh:</Text>
            <Text style={{ marginTop: 30 }}>_________________________</Text>
            <Text>Pannanda Liko Yu</Text>
            <Text>Asset Control</Text>
          </View>
          <View style={styles.approvalBox}>
            <Text style={{ marginTop: 30 }}>_________________________</Text>
            <Text>Devi Tanaya</Text>
            <Text>Senior Operational Manager</Text>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.notes}>
          <Text style={{ fontWeight: "bold" }}>Catatan:</Text>
          <Text>
            1. Temuan kendala (rusak, bocor, cisb.) harap segera dilapor ke
            plhak aset dan/atau divisi yang bertanggung jawab.
          </Text>
          <Text>
            2. Daily Maintenance Checklist wajib dikumpulkan setiap hari Sabtu
            kepada Admin Teknik
          </Text>
        </View>
      </Page>

      
    </Document>
  );
};

export default BendingMachineChecklistPDF;
