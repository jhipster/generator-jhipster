import * as React from 'react';
import { Table, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const HealthModal = ({ handleClose, healthObject, showModal }) => (
    <Modal
      isOpen={showModal} modalTransition={{ timeout: 20 }} backdropTransition={{ timeout: 10 }}
      toggle={handleClose}
    >
    <ModalHeader toggle={handleClose}>{healthObject.name}</ModalHeader>
    <ModalBody>
      <Table bordered>
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(healthObject).map((key, index) => (
          <tr key={index}>
            <td>{key}</td>
            <td>{healthObject[key]}</td>
          </tr>
          ))}
        </tbody>
      </Table>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={handleClose}>Close</Button>
    </ModalFooter>
  </Modal>
);

export default HealthModal;
