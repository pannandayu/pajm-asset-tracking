import { formatCurrency } from "@/pages/catalog/detail";
import { Asset } from "@/types";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import dayjs from "dayjs";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a365d",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#4a5568",
    marginBottom: 3,
  },
  image: {
    width: 150,
    height: 150,
    marginVertical: 15,
    alignSelf: "center",
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    marginVertical: 15,
    alignSelf: "center",
    backgroundColor: "#f0f0f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderStyle: "dashed",
  },
  placeholderText: {
    fontSize: 10,
    color: "#a0a0a0",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 180,
    fontSize: 12,
    fontWeight: "bold",
  },
  value: {
    fontSize: 12,
    flex: 1,
  },
  componentItem: {
    marginLeft: 15,
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#e2e8f0",
    paddingLeft: 10,
  },
  componentTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },
  componentDetail: {
    fontSize: 10,
    marginBottom: 2,
  },
  historyItem: {
    fontSize: 10,
    marginLeft: 10,
    marginBottom: 2,
  },
  footer: {
    fontSize: 10,
    color: "#718096",
    textAlign: "center",
    marginTop: 20,
  },
  statusActive: {
    color: "#38a169",
  },
  statusInactive: {
    color: "#e53e3e",
  },
});

// Function to check if image URL is valid and accessible
const isImageAccessible = (url: string) => {
  if (!url) return false;

  // Check if URL is a data URI (base64 encoded)
  if (url.startsWith("data:image/")) return true;

  // Check if URL is from a known domain or has proper protocol
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Additional checks could be added here for specific domains
    return true;
  }

  // Relative paths might not work in PDF rendering
  return false;
};

export const AssetPdfDocument = ({
  asset,
  assetImageUrl,
  tagging,
  username,
}: {
  asset: Asset;
  assetImageUrl: string;
  tagging: string;
  username: string;
}) => {
  // Check if the image URL is valid and accessible
  const hasValidImage = isImageAccessible(assetImageUrl);

  return (
    <Document>
      {/* First Page */}
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>{asset.name}</Text>
          <Text style={styles.subtitle}>ID: {asset.id}</Text>
          <Text
            style={[
              styles.subtitle,
              asset.status === "Active"
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            Status: {asset.status}
          </Text>

          {/* Image with error handling */}
          {!hasValidImage ? (
            <Image src={assetImageUrl} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>
                {assetImageUrl ? "Image not available" : "No image provided"}
              </Text>
            </View>
          )}
        </View>

        {/* Rest of the PDF content remains the same */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Information</Text>
          {[
            { label: "Asset Name", value: asset.name },
            { label: "Brand", value: asset.brand || "-" },
            { label: "Model", value: asset.model || "-" },
            { label: "Category", value: asset.category },
            { label: "Sub-Category", value: asset.sub_category },
            { label: "Serial Number", value: asset.serial_number || "-" },
            { label: "Part Number", value: asset.part_number || "-" },
            { label: "Ownership (Dept.)", value: asset.department_owner },
            { label: "Primary User", value: asset.primary_user },
            {
              label: "First Usage/Installation Date",
              value: asset.active_date
                ? dayjs(asset.active_date).format("DD MMMM YYYY")
                : "-",
            },
            { label: "Status", value: asset.status },
          ].map((field, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{field.label}:</Text>
              <Text style={styles.value}>{field.value}</Text>
            </View>
          ))}
        </View>

        {/* Financial Information */}
        {tagging !== "1" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Information</Text>
            {[
              {
                label: "Purchase Date",
                value: asset.purchase_date
                  ? dayjs(asset.purchase_date).format("DD MMMM YYYY")
                  : "-",
              },
              {
                label: "Purchase Order Number",
                value: asset.purchase_order_number || "-",
              },
              { label: "Vendor", value: asset.vendor_supplier || "-" },
              { label: "Warranty", value: asset.warranty || "-" },
              {
                label: "Purchase Price",
                value: formatCurrency(asset.purchase_price),
              },
              {
                label: "Expected Lifespan",
                value: `${asset.expected_lifespan || 0} years`,
              },
              {
                label: "Depreciation Method",
                value: asset.depreciation_method || "-",
              },
              {
                label: "Annual Depreciation Rate",
                value: `${asset.depreciation_rate || 0}%`,
              },
              {
                label: "Current Book Value",
                value: formatCurrency(asset.current_book_value),
              },
            ].map((field, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{field.label}:</Text>
                <Text style={styles.value}>{field.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer for first page */}
        <Text style={styles.footer}>
          Auto-Generated {dayjs().format("DD MMMM YYYY - HH:mm")} by {username}
        </Text>
      </Page>

      {/* Second Page */}
      <Page size="A4" style={styles.page}>
        {/* Components Section */}
        <Text style={styles.sectionTitle}>
          Component(s) ({asset.component_items?.length || 0})
        </Text>
        {asset.component_items && asset.component_items?.length > 0 && (
          <View style={styles.section}>
            {asset.component_items.map((component, index) => (
              <View key={index} style={styles.componentItem}>
                <Text style={styles.componentTitle}>
                  {index + 1}. {component.name}
                </Text>
                <Text style={styles.componentDetail}>
                  ID: {component.component_id || "-"}
                </Text>
                <Text style={styles.componentDetail}>
                  Brand: {component.brand || "-"}
                </Text>
                <Text style={styles.componentDetail}>
                  Model: {component.model || "-"}
                </Text>

                {component.archive?.length > 0 && (
                  <>
                    <Text
                      style={[styles.componentDetail, { fontWeight: "bold" }]}
                    >
                      History:
                    </Text>
                    {component.archive.map((record, idx) => (
                      <Text key={idx} style={styles.historyItem}>
                        • {dayjs(record.purchase_date).format("DD MMMM YYYY")}:{" "}
                        {record.purchase_order_number} -{" "}
                        {record.supplier_vendor}{" "}
                        {tagging === "0" &&
                          "- " + formatCurrency(record.purchase_price)}
                        {" - " + record.status}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            ))}
          </View>
        )}
        {/* Footer for second page */}
        <Text style={styles.footer}>
          Auto-Generated {dayjs().format("DD MMMM YYYY - HH:mm")} by {username}
        </Text>
      </Page>

      {/* Third Page */}
      <Page size="A4" style={styles.page}>
        {/* Complementary Items Section */}
        <Text style={styles.sectionTitle}>
          Complementary Asset(s) ({asset.complementary_items?.length || 0})
        </Text>
        {asset.complementary_items && asset.complementary_items?.length > 0 && (
          <View style={styles.section}>
            {asset.complementary_items.map((item, index) => (
              <View key={index} style={styles.componentItem}>
                <Text style={styles.componentTitle}>
                  {index + 1}. {item.name}
                </Text>
                <Text style={styles.componentDetail}>
                  ID: {item.complementary_id || "-"}
                </Text>
                <Text style={styles.componentDetail}>
                  Brand: {item.brand || "-"}
                </Text>
                <Text style={styles.componentDetail}>
                  Model: {item.model || "-"}
                </Text>
                <Text style={styles.componentDetail}>
                  Category: {item.category || "-"}
                </Text>
                <Text style={styles.componentDetail}>
                  Sub-Category: {item.sub_category || "-"}
                </Text>

                {item.archive?.length > 0 && (
                  <>
                    <Text
                      style={[styles.componentDetail, { fontWeight: "bold" }]}
                    >
                      History:
                    </Text>
                    {item.archive.map((record, idx) => (
                      <Text key={idx} style={styles.historyItem}>
                        • {dayjs(record.purchase_date).format("DD MMMM YYYY")}:{" "}
                        {record.purchase_order_number} -{" "}
                        {record.supplier_vendor}
                        {tagging === "0" &&
                          " - " + formatCurrency(record.purchase_price)}{" "}
                        - {record.status}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            ))}
          </View>
        )}
        {/* Footer for third page */}
        <Text style={styles.footer}>
          Auto-Generated {dayjs().format("DD MMMM YYYY - HH:mm")} by {username}
        </Text>
      </Page>
    </Document>
  );
};
