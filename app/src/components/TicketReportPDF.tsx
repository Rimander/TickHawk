import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Ticket } from '../models/ticket.model';

// Register fonts if needed (optional)
// Font.register({
//   family: 'Roboto',
//   fonts: [
//     { src: '/fonts/Roboto-Regular.ttf' },
//     { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' }
//   ]
// });

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  logo: {
    width: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5
  },
  dateRange: {
    fontSize: 12,
    color: '#6b7280'
  },
  summaryContainer: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937'
  },
  summaryText: {
    fontSize: 12,
    color: '#4b5563'
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 30,
    alignItems: 'center'
  },
  tableRowHeader: {
    backgroundColor: '#f9fafb',
  },
  tableCol: {
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'left'
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'left'
  },
  subjectCol: { width: '25%' },
  statusCol: { width: '12%' },
  priorityCol: { width: '12%' },
  departmentCol: { width: '15%' },
  agentCol: { width: '15%' },
  dateCol: { width: '12%' },
  hoursCol: { width: '9%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  },
  section: {
    marginBottom: 10
  },
  text: {
    fontSize: 12,
    color: '#4b5563'
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    fontSize: 8,
    color: 'white',
    textAlign: 'center'
  },
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    fontSize: 8,
    color: 'white',
    textAlign: 'center'
  }
});

// Status badge styles - Updated to match web colors
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return { backgroundColor: '#22c55e' }; // green
    case 'in-progress':
      return { backgroundColor: '#a855f7' }; // purple
    case 'closed':
      return { backgroundColor: '#ef4444' }; // red
    case 'pending':
      return { backgroundColor: '#a855f7' }; // purple
    case 'resolved':
      return { backgroundColor: '#22c55e' }; // green
    case 'in-review':
      return { backgroundColor: '#f97316' }; // orange
    default:
      return { backgroundColor: '#9ca3af' }; // gray
  }
};

// Priority badge styles
const getPriorityStyle = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return { backgroundColor: '#ef4444' }; // red
    case 'medium':
      return { backgroundColor: '#f59e0b' }; // amber
    case 'low':
      return { backgroundColor: '#10b981' }; // green
    default:
      return { backgroundColor: '#9ca3af' }; // gray
  }
};

// Format date function
const formatDate = (date: Date | string) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString();
};

interface TicketReportPDFProps {
  tickets: Ticket[];
  totalHours: number;
  companyName?: string;
  startDate: string;
  endDate: string;
}

const TicketReportPDF: React.FC<TicketReportPDFProps> = ({ 
  tickets, 
  totalHours, 
  companyName, 
  startDate, 
  endDate 
}) => {
  // Format the date range
  const formattedStartDate = startDate ? formatDate(startDate) : 'N/A';
  const formattedEndDate = endDate ? formatDate(endDate) : 'N/A';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with logo and title */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              style={styles.logo} 
              src="/assets/images/tickhawk.png" 
            />
            <Text style={styles.title}>Ticket Report</Text>
            {companyName && (
              <Text style={styles.subtitle}>Company: {companyName}</Text>
            )}
            <Text style={styles.dateRange}>
              Period: {formattedStartDate} - {formattedEndDate}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.dateRange}>Generated: {formatDate(new Date())}</Text>
          </View>
        </View>

        {/* Summary section */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>Total Tickets: {tickets.length}</Text>
          <Text style={styles.summaryText}>Total Hours: {totalHours}</Text>
        </View>

        {/* Tickets table */}
        <View style={styles.table}>
          {/* Table header */}
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={[styles.tableCol, styles.subjectCol]}>
              <Text style={styles.tableCellHeader}>Subject</Text>
            </View>
            <View style={[styles.tableCol, styles.statusCol]}>
              <Text style={styles.tableCellHeader}>Status</Text>
            </View>
            <View style={[styles.tableCol, styles.priorityCol]}>
              <Text style={styles.tableCellHeader}>Priority</Text>
            </View>
            <View style={[styles.tableCol, styles.departmentCol]}>
              <Text style={styles.tableCellHeader}>Department</Text>
            </View>
            <View style={[styles.tableCol, styles.agentCol]}>
              <Text style={styles.tableCellHeader}>Agent</Text>
            </View>
            <View style={[styles.tableCol, styles.dateCol]}>
              <Text style={styles.tableCellHeader}>Created</Text>
            </View>
            <View style={[styles.tableCol, styles.hoursCol]}>
              <Text style={styles.tableCellHeader}>Hours</Text>
            </View>
          </View>

          {/* Table body */}
          {tickets.map((ticket) => {
            // Calculate ticket hours
            let hours = 0;
            if (ticket.minutes) {
              hours += ticket.minutes / 60;
            }
            if (ticket.comments && ticket.comments.length > 0) {
              ticket.comments.forEach(comment => {
                hours += comment.hours || 0;
              });
            }
            
            return (
              <View style={styles.tableRow} key={ticket._id}>
                <View style={[styles.tableCol, styles.subjectCol]}>
                  <Text style={styles.tableCell}>{ticket.subject}</Text>
                </View>
                <View style={[styles.tableCol, styles.statusCol]}>
                  <View style={[styles.statusBadge, getStatusStyle(ticket.status)]}>
                    <Text style={{ color: 'white', fontSize: 8 }}>
                      {ticket.status === 'open' ? 'Open' :
                       ticket.status === 'in-progress' ? 'In progress' :
                       ticket.status === 'closed' ? 'Closed' :
                       ticket.status === 'pending' ? 'Pending' :
                       ticket.status === 'resolved' ? 'Resolved' :
                       ticket.status === 'in-review' ? 'In review' :
                       ticket.status}
                    </Text>
                  </View>
                </View>
                <View style={[styles.tableCol, styles.priorityCol]}>
                  <View style={[styles.priorityBadge, getPriorityStyle(ticket.priority)]}>
                    <Text style={{ color: 'white', fontSize: 8 }}>{ticket.priority}</Text>
                  </View>
                </View>
                <View style={[styles.tableCol, styles.departmentCol]}>
                  <Text style={styles.tableCell}>{ticket.department?.name || 'N/A'}</Text>
                </View>
                <View style={[styles.tableCol, styles.agentCol]}>
                  <Text style={styles.tableCell}>{ticket.agent?.name || 'Unassigned'}</Text>
                </View>
                <View style={[styles.tableCol, styles.dateCol]}>
                  <Text style={styles.tableCell}>{formatDate(ticket.createdAt)}</Text>
                </View>
                <View style={[styles.tableCol, styles.hoursCol]}>
                  <Text style={styles.tableCell}>{hours.toFixed(2)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>TickHawk - Ticket Management System - {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default TicketReportPDF;