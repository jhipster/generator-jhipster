'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles,
  JDLParser = require('../../../lib/parser/jdl_parser'),
  JDLEntity = require('../../../lib/core/jdl_entity'),
  JDLEnum = require('../../../lib/core/jdl_enum'),
  JDLField = require('../../../lib/core/jdl_field'),
  JDLValidation = require('../../../lib/core/jdl_validation'),
  JDLUnaryOption = require('../../../lib/core/jdl_unary_option'),
  JDLBinaryOption = require('../../../lib/core/jdl_binary_option'),
  FieldTypes = require('../../../lib/core/jhipster/field_types').SQL_TYPES,
  Validations = require('../../../lib/core/jhipster/validations').VALIDATIONS,
  UnaryOptions = require('../../../lib/core/jhipster/unary_options').UNARY_OPTIONS,
  BinaryOptions = require('../../../lib/core/jhipster/binary_options').BINARY_OPTIONS,
  BinaryOptionValues = require('../../../lib/core/jhipster/binary_options').BINARY_OPTION_VALUES;

describe('JDLParser', function () {
  describe('::parse', function () {
    describe('when passing invalid args', function () {
      describe('because there is no document', function () {
        it('fails', function () {
          try {
            JDLParser.parse(null, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there is no database type', function () {
        it('fails', function () {
          try {
            JDLParser.parse({
              notNull: 42
            }, null);
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe("because the database type doesn't exist", function () {
        it('fails', function () {
          try {
            JDLParser.parse({
              notNull: 42
            }, 'WRONG');
            fail();
          } catch (error) {
            expect(error.name).to.eq('IllegalArgumentException');
          }
        });
      });
    });
    describe('when passing valid args', function () {
      describe('with no error', function () {
        var input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
        var content = JDLParser.parse(input, 'mysql');
        it('builds a JDLObject', function () {
          expect(content).not.to.be.null;
          expect(content.entities.Department).to.deep.eq(new JDLEntity({
            name: 'Department',
            tableName: 'Department',
            fields: {
              departmentId: new JDLField({
                name: 'departmentId',
                type: FieldTypes.LONG
              }),
              departmentName: new JDLField({
                name: 'departmentName',
                type: FieldTypes.STRING,
                validations: {required: new JDLValidation({name: Validations.REQUIRED})}
              })
            }
          }));
          expect(content.entities.JobHistory).to.deep.eq(new JDLEntity({
            name: 'JobHistory',
            tableName: 'JobHistory',
            fields: {
              startDate: new JDLField({
                name: 'startDate',
                type: FieldTypes.ZONED_DATE_TIME
              }),
              endDate: new JDLField({
                name: 'endDate',
                type: FieldTypes.ZONED_DATE_TIME
              }),
              language: new JDLField({name: 'language', type: 'Language'})
            },
            comment: 'JobHistory comment.'
          }));
          expect(content.enums.JobType).to.deep.eq(new JDLEnum({
            name: 'JobType',
            values: ['TYPE1', 'TYPE2']
          }));
          expect(content.entities.Job).to.deep.eq(new JDLEntity({
            name: 'Job',
            tableName: 'Job',
            fields: {
              jobId: new JDLField({name: 'jobId', type: FieldTypes.LONG}),
              jobTitle: new JDLField({
                name: 'jobTitle',
                type: FieldTypes.STRING,
                validations: {
                  minlength: new JDLValidation({
                    name: Validations.MINLENGTH,
                    value: 5
                  }),
                  maxlength: new JDLValidation({
                    name: Validations.MAXLENGTH,
                    value: 25
                  })
                }
              }),
              jobType: new JDLField({name: 'jobType', type: 'JobType'}),
              minSalary: new JDLField({
                name: 'minSalary',
                type: FieldTypes.LONG
              }),
              maxSalary: new JDLField({
                name: 'maxSalary',
                type: FieldTypes.LONG
              })
            }
          }));
          expect(content.options).to.deep.eq([
            new JDLUnaryOption({
              name: UnaryOptions.SKIP_SERVER,
              entityNames: ['Country']
            }),
            new JDLBinaryOption({
              name: BinaryOptions.DTO,
              entityNames: ['Employee'],
              value: BinaryOptionValues.dto.MAPSTRUCT
            }),
            new JDLBinaryOption({
              name: BinaryOptions.SERVICE,
              entityNames: ['Employee'],
              value: BinaryOptionValues.service.SERVICE_CLASS
            }),
            new JDLBinaryOption({
              name: BinaryOptions.PAGINATION,
              entityNames: ['JobHistory', 'Employee'],
              value: BinaryOptionValues.pagination['INFINITE-SCROLL']
            }),
            new JDLBinaryOption({
              name: BinaryOptions.PAGINATION,
              entityNames: ['Job'],
              value: BinaryOptionValues.pagination.PAGINATION
            }),
            new JDLBinaryOption({
              name: BinaryOptions.MICROSERVICE,
              entityNames: ['*'],
              value: 'mymicroservice'
            }),
            new JDLBinaryOption({
              name: BinaryOptions.SEARCH_ENGINE,
              entityNames: ['Employee'],
              value: BinaryOptionValues.searchEngine.ELASTIC_SEARCH
            })
          ]);
        });
      });
      describe('with a required relationship', function () {
        var input = parseFromFiles(['./test/test_files/required_relationships.jdl']);
        var content = JDLParser.parse(input, 'sql');
        it('adds it', function () {
          expect(content.relationships.relationships.OneToOne['OneToOne_A{b}_B{a}'].isInjectedFieldInFromRequired).to.be.true;
          expect(content.relationships.relationships.OneToOne['OneToOne_A{b}_B{a}'].isInjectedFieldInToRequired).to.be.false;
        });
      });
      describe("with a field name 'id'", function () {
        var input = parseFromFiles(['./test/test_files/id_field.jdl']);
        var content = JDLParser.parse(input, 'sql');
        it("doesn't add it", function () {
          expect(content.entities.A).to.deep.eq(new JDLEntity({
            name: 'A',
            tableName: 'A',
            fields: {
              email: new JDLField({name: 'email', type: FieldTypes.STRING})
            }
          }));
        });
      });
      describe('with an invalid field type', function () {
        var input = parseFromFiles(['./test/test_files/invalid_field_type.jdl']);
        it('fails', function () {
          try {
            JDLParser.parse(input, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('WrongTypeException');
          }
        });
      });
      describe('with an unexistent validation for a field type', function () {
        var input = parseFromFiles(['./test/test_files/non_existent_validation.jdl']);
        it('fails', function () {
          try {
            JDLParser.parse(input, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('WrongValidationException');
          }
        });
      });
      describe('with entities that do not exist for a relationship', function () {
        var input = parseFromFiles(['./test/test_files/unexistent_entities_for_relationship.jdl']);
        it('fails', function () {
          try {
            JDLParser.parse(input, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('UndeclaredEntityException');
          }
        });
      });
      describe('with User entity as from for a relationship', function () {
        var input = parseFromFiles(['./test/test_files/user_entity_from_relationship.jdl']);
        it('fails', function () {
          try {
            JDLParser.parse(input, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('IllegalAssociationException');
          }
        });
      });
      describe('with User entity as to for a relationship', function () {
        var input = parseFromFiles(['./test/test_files/user_entity_to_relationship.jdl']);
        var content = JDLParser.parse(input, 'sql');
        it('is processed', function () {
          expect(content.relationships.relationships.ManyToOne['ManyToOne_A{user}_User{a}'].to.name).to.eq('User');
          expect(content.relationships.relationships.OneToOne['OneToOne_B{user}_User'].to.name).to.eq('User');
        });
      });
      describe('with an invalid option', function () {
        var input = parseFromFiles(['./test/test_files/invalid_option.jdl']);
        it('fails', function () {
          try {
            JDLParser.parse(input, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('IllegalArgumentException');
          }
        });
      });
      describe('with a required enum', function () {
        var input = parseFromFiles(['./test/test_files/enum.jdl']);
        var content = JDLParser.parse(input, 'sql');
        var enumField = new JDLField({
          name: 'sourceType',
          type: 'MyEnum'
        });
        enumField.addValidation(new JDLValidation({
          name: Validations.REQUIRED
        }));
        it('adds it', function () {
          expect(content.enums.MyEnum).to.deep.eq(new JDLEnum({
            name: 'MyEnum',
            values: ['AAA', 'BBB', 'CCC']
          }));
          expect(content.entities.MyEntity.fields.sourceType).to.deep.eq(enumField);
        });
      });
      describe('when using the noFluentMethods option', function () {
        var input = parseFromFiles(['./test/test_files/fluent_methods.jdl']);
        var content = JDLParser.parse(input, 'sql');
        it('adds it correctly', function () {
          expect(content.options).to.deep.eq([
            new JDLUnaryOption({
              name: UnaryOptions.NO_FLUENT_METHOD,
              entityNames: ['A']
            })
          ]);
          input = parseFromFiles(['./test/test_files/fluent_methods2.jdl']);
          content = JDLParser.parse(input, 'sql');
          expect(content.options).to.deep.eq([
            new JDLUnaryOption({
              name: UnaryOptions.NO_FLUENT_METHOD,
              entityNames: ['*'],
              excludedNames: ['A']
            })
          ]);
        });
      });
      describe('when having following comments', function () {
        var input = parseFromFiles(['./test/test_files/following_comments.jdl']);
        var content = JDLParser.parse(input, 'sql');
        it('accepts them', function () {
          expect(content.entities.A.fields.name.comment).to.eq('abc');
          expect(content.entities.A.fields.thing.comment).to.eq('def');
          expect(content.entities.A.fields.another.comment).to.eq('ghi');
        });
        describe('when having both forms of comments', function () {
          it('only accepts the one defined first', function () {
            expect(content.entities.B.fields.name.comment).to.eq('xyz');
          });
        });
        describe('when using commas', function () {
          it('assigns the comment to the next field', function () {
            expect(content.entities.C.fields.name.comment).to.be.undefined;
            expect(content.entities.C.fields.thing.comment).to.eq('abc');
          });
        });
      });
      describe('when parsing another complex JDL file', function () {
        var input = parseFromFiles(['./test/test_files/complex_jdl_2.jdl']);
        var content = JDLParser.parse(input, 'sql');
        it('parses it', function () {
          expect(content.entities.A).to.deep.eq({
            name: 'A',
            tableName: 'A',
            fields: {},
            comment: undefined
          });
          expect(content.entities.B).to.deep.eq({
            name: 'B',
            tableName: 'B',
            fields: {},
            comment: undefined
          });
          expect(content.entities.C).to.deep.eq({
            name: 'C',
            tableName: 'C',
            fields: {
              name: {
                comment: undefined,
                name: 'name',
                type: 'String',
                validations: {
                  required: {
                    name: 'required',
                    value: ''
                  }
                }
              }
            },
            comment: undefined
          });
          expect(content.entities.D).to.deep.eq({
            name: 'D',
            tableName: 'D',
            fields: {
              name: {
                comment: undefined,
                name: 'name',
                type: 'String',
                validations: {
                  required: {
                    name: 'required',
                    value: ''
                  },
                  minlength: {
                    name: 'minlength',
                    value: 1
                  },
                  maxlength: {
                    name: 'maxlength',
                    value: 42
                  }
                }
              },
              count: {
                comment: undefined,
                name: 'count',
                type: 'Integer',
                validations: {}
              }
            },
            comment: undefined
          });
          expect(content.entities.E).to.deep.eq({
            name: 'E',
            tableName: 'E',
            fields: {},
            comment: undefined
          });
          expect(content.entities.F).to.deep.eq({
            name: 'F',
            tableName: 'F',
            fields: {
              name: {
                comment: 'My comment for name of F.',
                name: 'name',
                type: 'String',
                validations: {}
              },
              count: {
                comment: undefined,
                name: 'count',
                type: 'Integer',
                validations: {}
              },
              flag: {
                comment: 'My comment for flag of F.',
                name: 'flag',
                type: 'Boolean',
                validations: {
                  required: {
                    name: 'required',
                    value: ''
                  }
                }
              }
            },
            comment: 'My comment for F.'
          });
          expect(content.entities.G).to.deep.eq({
            name: 'G',
            tableName: 'G',
            fields: {
              name: {
                comment: 'xyz',
                name: 'name',
                type: 'String',
                validations: {
                  required: {
                    name: 'required',
                    value: ''
                  }
                }
              },
              count: {
                comment: 'def',
                name: 'count',
                type: 'Integer',
                validations: {}
              }
            },
            comment: undefined
          });
          expect(content.options.length).to.eq(7);
          expect(content.options[0].name).to.eq('skipClient');
          expect(content.options[0].entityNames.toString()).to.eq('[G]');
          expect(content.options[0].excludedNames.toString()).to.eq('[]');
          expect(content.options[1].name).to.eq('skipServer');
          expect(content.options[1].entityNames.toString()).to.eq('[B,D]');
          expect(content.options[1].excludedNames.toString()).to.eq('[D]');
          expect(content.options[2].name).to.eq('dto');
          expect(content.options[2].value).to.eq('mapstruct');
          expect(content.options[2].entityNames.toString()).to.eq('[*]');
          expect(content.options[2].excludedNames.toString()).to.eq('[G]');
          expect(content.options[3].name).to.eq('service');
          expect(content.options[3].entityNames.toString()).to.eq('[G]');
          expect(content.options[3].excludedNames.toString()).to.eq('[]');
          expect(content.options[3].value).to.eq('serviceImpl');
          expect(content.options[4].name).to.eq('service');
          expect(content.options[4].entityNames.toString()).to.eq('[A,C,D]');
          expect(content.options[4].excludedNames.toString()).to.eq('[]');
          expect(content.options[4].value).to.eq('serviceClass');
          expect(content.options[5].name).to.eq('pagination');
          expect(content.options[5].entityNames.toString()).to.eq('[*]');
          expect(content.options[5].excludedNames.toString()).to.eq('[G]');
          expect(content.options[5].value).to.eq('pager');
          expect(content.options[6].name).to.eq('pagination');
          expect(content.options[6].entityNames.toString()).to.eq('[G]');
          expect(content.options[6].excludedNames.toString()).to.eq('[]');
          expect(content.options[6].value).to.eq('pagination');
        });
      });
      describe('when having two consecutive comments for fields', function () {
        var input = parseFromFiles(['./test/test_files/field_comments.jdl']);
        var content = JDLParser.parse(input, 'sql');
        it('assigns them correctly', function () {
          expect(content.entities.TestEntity.fields).to.deep.eq({
            first: {
              name: 'first',
              comment: 'first comment',
              type: 'String',
              validations: {}
            },
            second: {
              name: 'second',
              comment: 'second comment',
              type: 'String',
              validations: {}
            },
            third: {
              name: 'third',
              comment: undefined,
              type: 'Integer',
              validations: {}
            },
            fourth: {
              name: 'fourth',
              comment: 'another',
              type: 'String',
              validations: {}
            }
          });
          expect(content.entities.TestEntity2.fields).to.deep.eq({
            first: {
              name: 'first',
              comment: 'first comment',
              type: 'String',
              validations: {
                required: {
                  name: 'required',
                  value: ''
                }
              }
            },
            second: {
              name: 'second',
              comment: 'second comment',
              type: 'String',
              validations: {}
            }
          });
        });
      });
      describe('when having constants', function () {
        const input = parseFromFiles(['./test/test_files/constants.jdl']);
        const content = JDLParser.parse(input, 'sql');
        it("assigns the constants' value when needed", function () {
          expect(content.entities.A.fields).to.deep.eq({
            name: {
              name: 'name',
              comment: undefined,
              type: 'String',
              validations: {
                minlength: {
                  name: 'minlength',
                  value: 1
                },
                maxlength: {
                  name: 'maxlength',
                  value: 42
                }
              }
            },
            content: {
              name: 'content',
              comment: undefined,
              type: 'TextBlob',
              validations: {
                minbytes: {
                  name: 'minbytes',
                  value: 20
                },
                maxbytes: {
                  name: 'maxbytes',
                  value: 40
                }
              }
            },
            count: {
              name: 'count',
              comment: undefined,
              type: 'Integer',
              validations: {
                min: {
                  name: 'min',
                  value: 0
                },
                max: {
                  name: 'max',
                  value: 41
                }
              }
            }
          });
        });
      });
    });
  });
});
